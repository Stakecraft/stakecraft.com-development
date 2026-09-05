import crypto from "crypto";
import { loadEnvFiles } from "./loadEnvFiles.js";

// Real process env (systemd, Docker, CI) wins over file contents. Empty
// assignments in one file do not hide a value in the other. If NODE_ENV is
// unset but only .env.production exists, that host is treated as production.
const nodeEnv = loadEnvFiles();
const isProduction = nodeEnv === "production";

// Secrets that ship in example files or old tutorials. If one of these ever
// reaches a running server, every token it issues is forgeable by anyone.
const FORBIDDEN_SECRETS = new Set([
  "your-secret-key",
  "your-jwt-secret-change-in-production",
  "secret",
  "changeme",
  "change-me",
  "jwt-secret",
]);

const MIN_SECRET_LENGTH = 32;

const fail = (message) => {
  const suggestion = crypto.randomBytes(48).toString("base64url");
  console.error("\n" + "=".repeat(72));
  console.error("FATAL: insecure or incomplete configuration - refusing to start");
  console.error("=".repeat(72));
  console.error(message);
  console.error(
    `\nGenerate a strong secret with:\n  openssl rand -base64 48\n\nOr use this one:\n  JWT_SECRET=${suggestion}\n`
  );
  console.error("=".repeat(72) + "\n");
  process.exit(1);
};

const resolveJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim() === "") {
    if (isProduction) {
      fail("JWT_SECRET is not set. It is required in production.");
    }
    // Development convenience: run with an ephemeral secret rather than a
    // shared hardcoded one. Tokens do not survive a restart, which is fine
    // locally and impossible to accidentally ship.
    const ephemeral = crypto.randomBytes(48).toString("base64url");
    console.warn(
      "\nWARNING: JWT_SECRET is not set. Generated a random one for this process only.\n" +
        "         All issued tokens become invalid when the server restarts.\n" +
        "         Set JWT_SECRET in .env.development for a stable dev session.\n"
    );
    return ephemeral;
  }

  if (FORBIDDEN_SECRETS.has(secret.trim().toLowerCase())) {
    fail(
      `JWT_SECRET is set to the well-known placeholder "${secret}".\n` +
        "Anyone can forge admin tokens with it. Replace it with a random value."
    );
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    fail(
      `JWT_SECRET is only ${secret.length} characters. ` +
        `At least ${MIN_SECRET_LENGTH} are required to resist offline brute force.`
    );
  }

  return secret;
};

const resolveMongoUri = () => {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGODB_URI_PRODUCTION ||
    (isProduction ? null : "mongodb://127.0.0.1:27017/stakecraft_dev");

  if (!uri) {
    fail("MONGODB_URI is not set. It is required in production.");
  }
  return uri;
};

const parseOrigins = (value) =>
  (value || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

export const config = {
  nodeEnv,
  isProduction,
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: resolveMongoUri(),
  jwt: {
    secret: resolveJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  },
  // Extra origins may be supplied as a comma-separated list without editing code.
  extraCorsOrigins: parseOrigins(process.env.CORS_ORIGINS || process.env.CORS_EXTRA_ORIGINS),
  frontendUrl: process.env.FRONTEND_URL || "",
  // The public bootstrap route stays off unless explicitly switched on.
  allowPublicSetup: process.env.ALLOW_PUBLIC_SETUP === "true",
  pinata: {
    apiKey: process.env.PINATA_API_KEY || "",
    secretKey: process.env.PINATA_SECRET_KEY || "",
    jwt: (process.env.PINATA_JWT || "").trim(),
  },
  // Optional — enables validators.app score/rank on the Solana trust strip.
  validatorsAppToken: (process.env.VALIDATORS_APP_TOKEN || "").trim(),
  // Optional — SVT / thevalidators.io JWT for JPool TVC rank (Discord: jfactory).
  svtApiToken: (process.env.SVT_API_TOKEN || "").trim(),
  // Optional — manual Vault Elite badge when confirmed (no public Elite API).
  // Set VAULT_ELITE=true for a plain "Elite" chip, or VAULT_ELITE_RANK=12 for "#12".
  vaultEliteEnabled: ["1", "true", "yes"].includes(
    String(process.env.VAULT_ELITE || "").trim().toLowerCase()
  ),
  vaultEliteRank: (() => {
    const raw = String(process.env.VAULT_ELITE_RANK || "").trim();
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
  })(),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),
};

// Loud warning for the dev/prod database sharing problem: pointing a
// development server at the production cluster means test writes hit real data.
if (!isProduction && /mongodb\+srv:\/\//.test(config.mongoUri)) {
  console.warn(
    "\nWARNING: development server is connected to a remote MongoDB cluster.\n" +
      "         Writes from this process will affect that database.\n" +
      "         Point MONGODB_URI at a local instance for safe testing.\n"
  );
}

export default config;
