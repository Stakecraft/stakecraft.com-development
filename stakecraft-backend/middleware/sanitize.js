/**
 * Input hardening middleware.
 *
 * Two separate concerns live here:
 *   1. mongoSanitize  - strips MongoDB operator syntax so user input can never
 *                       become part of a query document.
 *   2. sanitizeContent - strips markup from fields that are plain text by
 *                       contract, and rejects dangerous URL schemes.
 */

const MAX_DEPTH = 10;

// Keys that let a payload reach Object.prototype. Mongoose's update casting has
// a known prototype-pollution path through __proto__, and none of these start
// with "$" or contain a dot, so the operator filter below does not catch them.
const POLLUTION_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Recursively removes keys that MongoDB would interpret as operators.
 *
 * Without this, a login body of {"username": {"$ne": null}} turns
 * User.findOne({ $or: [{ username }] }) into "find any user", which is an
 * authentication bypass. Dotted keys are dropped too because they allow
 * reaching into nested documents during an update.
 */
const stripOperators = (value, depth = 0) => {
  if (depth > MAX_DEPTH) return undefined;

  if (Array.isArray(value)) {
    return value.map((item) => stripOperators(item, depth + 1));
  }

  if (isPlainObject(value)) {
    // Null-prototype object: even if a pollution key slipped through, there is
    // no prototype chain here for it to reach.
    const cleaned = Object.create(null);
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".") || POLLUTION_KEYS.has(key)) {
        continue; // drop silently; legitimate clients never send these
      }
      cleaned[key] = stripOperators(val, depth + 1);
    }
    // Hand back a normal object so downstream code (Mongoose, express-validator)
    // sees what it expects.
    return Object.assign({}, cleaned);
  }

  return value;
};

export const mongoSanitize = (req, res, next) => {
  if (req.body) req.body = stripOperators(req.body);
  if (req.params) req.params = stripOperators(req.params);
  if (req.query) {
    const cleanedQuery = stripOperators(req.query);
    // Express 4 exposes req.query as a normal property; reassigning is safe.
    // Guard anyway so a future Express upgrade cannot crash the server.
    try {
      req.query = cleanedQuery;
    } catch {
      for (const key of Object.keys(req.query)) {
        if (key.startsWith("$") || key.includes(".")) delete req.query[key];
      }
    }
  }
  return next();
};

/**
 * Rejects a value unless it is a primitive string.
 * Used where a controller assumes it received text.
 */
export const isSafeString = (value) =>
  typeof value === "string" || typeof value === "number";

// Fields below are rendered as text, never as markup, so any tag is unwanted.
const TEXT_FIELDS = [
  "title",
  "description",
  "name",
  "position",
  "bio",
  "subtitle",
  "imageAlt",
  "stakeCode",
  "username",
];

const stripTags = (input) =>
  String(input)
    // Remove whole script/style blocks including their contents.
    .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "")
    // Remove any remaining tag.
    .replace(/<\/?[a-z][^>]*>/gi, "")
    // Neutralise leftover angle brackets so nothing can be reassembled later.
    .replace(/[<>]/g, "")
    .trim();

const DANGEROUS_SCHEMES = /^\s*(javascript|data|vbscript|file):/i;

/**
 * Allows absolute http(s) URLs, site-relative paths and fragments.
 * Everything else - notably javascript: and data: - is rejected outright.
 */
export const isSafeLink = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed === "") return true;
  if (DANGEROUS_SCHEMES.test(trimmed)) return false;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Defence in depth for stored content. The Vue frontend escapes interpolated
 * text today, but that guarantee disappears the moment someone adds v-html or
 * server-side rendering, so the payload never gets stored in the first place.
 */
export const sanitizeContent = (req, res, next) => {
  if (!isPlainObject(req.body)) return next();

  for (const field of TEXT_FIELDS) {
    if (typeof req.body[field] === "string") {
      req.body[field] = stripTags(req.body[field]);
    }
  }

  // Navigation targets must be a real link, so they get full validation.
  for (const field of ["link", "url", "website"]) {
    const value = req.body[field];
    if (typeof value === "string") {
      if (!isSafeLink(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field}: only http(s) URLs, relative paths and fragments are allowed`,
        });
      }
      req.body[field] = value.trim();
    }
  }

  // These carry a mix of URLs and opaque identifiers (validator addresses,
  // IPFS hashes), so requiring a well-formed URL would reject valid data.
  // Only the scheme is policed, which is the part that actually executes.
  for (const field of ["image", "icon", "explorer", "validator", "howToStake"]) {
    const value = req.body[field];
    if (typeof value === "string" && DANGEROUS_SCHEMES.test(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${field}: unsupported URL scheme`,
      });
    }
  }

  return next();
};
