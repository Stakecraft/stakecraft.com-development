#!/usr/bin/env node
/**
 * Security regression suite for the StakeCraft API.
 *
 * Reproduces every finding from the 2026-07-31 assessment plus the additional
 * issues found while remediating, and asserts each one is now closed. Run it
 * against a server before redeploying:
 *
 *   BASE_URL=http://localhost:5000 npm run test:security
 *
 * It seeds two throwaway accounts, exercises the API, and removes them again.
 * Point it only at a server you control - it performs write attempts.
 */
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
import User from "../models/User.js";
import Content from "../models/Content.js";
import { mongoSanitize } from "../middleware/sanitize.js";

const BASE_URL = (process.env.BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const ADMIN = {
  username: "sec_check_admin",
  email: "sec_check_admin@example.invalid",
  password: "Sup3rSecure-CheckPass!2026",
  role: "admin",
};
const EDITOR = {
  username: "sec_check_editor",
  email: "sec_check_editor@example.invalid",
  password: "Sup3rSecure-EditorPass!2026",
  role: "editor",
};

const results = [];
let adminToken = null;
let editorToken = null;
let adminId = null;

const colour = (code, text) =>
  process.stdout.isTTY ? `[${code}m${text}[0m` : text;
const green = (t) => colour(32, t);
const red = (t) => colour(31, t);
const dim = (t) => colour(90, t);

const record = (name, passed, detail) => {
  results.push({ name, passed, detail });
  const tag = passed ? green("PASS") : red("FAIL");
  console.log(`  ${tag}  ${name}${detail ? dim(`  (${detail})`) : ""}`);
};

/**
 * @param {object} opts
 * @param {string} [opts.raw]     body sent verbatim, no Content-Type
 * @param {string} [opts.rawJson] body sent verbatim as application/json - use
 *                                when the payload cannot survive a round trip
 *                                through an object literal (e.g. __proto__)
 */
const request = async (method, path, { token, body, raw, rawJson } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (rawJson !== undefined || (body !== undefined && !raw)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body:
        rawJson ?? raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    return { status: response.status, body: payload, headers: response.headers };
  } catch (error) {
    return { status: 0, body: null, error: error.message, headers: new Headers() };
  }
};

/** Asserts the endpoint refuses the request. 404 counts for routes that are
 *  meant to be invisible; anything 2xx is a live authentication bypass. */
const expectRejected = async (name, method, path, options = {}) => {
  const { status } = await request(method, path, options);
  const ok = [401, 403, 404].includes(status);
  record(name, ok, `HTTP ${status}`);
};

const expectStatus = async (name, method, path, expected, options = {}) => {
  const { status } = await request(method, path, options);
  const list = Array.isArray(expected) ? expected : [expected];
  record(name, list.includes(status), `HTTP ${status}, wanted ${list.join("/")}`);
};

const seed = async () => {
  await mongoose.connect(config.mongoUri);
  await User.deleteMany({ username: { $in: [ADMIN.username, EDITOR.username] } });
  const admin = await User.create(ADMIN);
  await User.create(EDITOR);
  adminId = admin._id.toString();
};

const cleanup = async () => {
  try {
    await User.deleteMany({ username: { $in: [ADMIN.username, EDITOR.username] } });
    await Content.deleteMany({ title: /^sec_check/ });
  } finally {
    await mongoose.disconnect();
  }
};

const login = async (creds) => {
  const { body } = await request("POST", "/api/auth/login", {
    body: { username: creds.username, password: creds.password },
  });
  return body?.token || null;
};

// ---------------------------------------------------------------------------

const testUnauthenticatedWrites = async () => {
  console.log("\nFindings 1-4: unauthenticated CRUD on users and content");

  const fakeId = "6a5a65f64809f6a5fd22ae78";

  await expectRejected("F1  POST   /api/users (admin creation)", "POST", "/api/users", {
    body: {
      username: "attacker",
      email: "attacker@evil.com",
      password: "P@ssw0rd123456",
      role: "admin",
    },
  });
  await expectRejected("F2  DELETE /api/users/:id (admin deletion)", "DELETE", `/api/users/${fakeId}`);
  await expectRejected("F3  GET    /api/users (user enumeration)", "GET", "/api/users");
  await expectRejected("F3  GET    /api/users/:id", "GET", `/api/users/${fakeId}`);
  await expectRejected("    PUT    /api/users/:id", "PUT", `/api/users/${fakeId}`, {
    body: { role: "admin" },
  });
  await expectRejected("    PUT    /api/users/:id/password", "PUT", `/api/users/${fakeId}/password`, {
    body: { newPassword: "NewPassword123456" },
  });
  await expectRejected("    GET    /api/users/me", "GET", "/api/users/me");

  await expectRejected("F4  POST   /api/content/menu", "POST", "/api/content/menu", {
    body: { type: "menu", title: "Free Tokens", link: "https://phishing.evil.com", order: 1 },
  });
  await expectRejected("F4  PUT    /api/content/menu/:id", "PUT", `/api/content/menu/${fakeId}`, {
    body: { link: "https://phishing.evil.com" },
  });
  await expectRejected("F4  DELETE /api/content/menu/:id", "DELETE", `/api/content/menu/${fakeId}`);
  await expectRejected("    PATCH  /api/content/menu/reorder", "PATCH", "/api/content/menu/reorder", {
    body: { items: [] },
  });
  await expectRejected("    POST   /api/content/menu/bulk", "POST", "/api/content/menu/bulk", {
    body: { action: "delete", ids: [fakeId] },
  });

  console.log("\nAdditional: collections the assessment did not reach");
  for (const resource of [
    "mainnet",
    "testnet",
    "partnership",
    "about",
    "team",
    "products",
  ]) {
    await expectRejected(`    POST   /api/${resource}`, "POST", `/api/${resource}`, {
      body: { title: "sec_check", description: "sec_check" },
    });
    await expectRejected(`    PUT    /api/${resource}/:id`, "PUT", `/api/${resource}/${fakeId}`, {
      body: { title: "sec_check" },
    });
    await expectRejected(`    DELETE /api/${resource}/:id`, "DELETE", `/api/${resource}/${fakeId}`);
  }

  await expectRejected("    GET    /api/admin/dashboard", "GET", "/api/admin/dashboard");
  await expectRejected("    POST   /api/upload/ipfs", "POST", "/api/upload/ipfs");
};

const testAuthBypass = async () => {
  console.log("\nAuthentication bypass attempts");

  await expectStatus(
    "    NoSQL operator injection in login",
    "POST",
    "/api/auth/login",
    [400, 401],
    { body: { username: { $ne: null }, password: { $ne: null } } }
  );

  await expectStatus("    Login with wrong password", "POST", "/api/auth/login", 401, {
    body: { username: ADMIN.username, password: "wrong-password-here" },
  });

  // The pre-fix code fell back to this well-known secret whenever JWT_SECRET
  // was unset - which it was in both .env files.
  const forged = jwt.sign({ userId: adminId, role: "admin" }, "your-secret-key", {
    expiresIn: "1h",
  });
  await expectRejected("    Token forged with default 'your-secret-key'", "GET", "/api/users", {
    token: forged,
  });

  const noneToken = `${Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
    "base64url"
  )}.${Buffer.from(JSON.stringify({ userId: adminId, role: "admin" })).toString(
    "base64url"
  )}.`;
  await expectRejected("    Token with alg=none", "GET", "/api/users", { token: noneToken });

  await expectRejected("    Garbage bearer token", "GET", "/api/users", { token: "not-a-token" });

  const expired = jwt.sign({ userId: adminId, role: "admin" }, config.jwt.secret, {
    expiresIn: "-1h",
  });
  await expectRejected("    Expired token", "GET", "/api/users", { token: expired });

  await expectStatus(
    "    Public setup route disabled",
    "POST",
    "/api/auth/setup",
    [403, 404, 409],
    { body: { username: "eviladmin", email: "e@evil.com", password: "Password123456!" } }
  );
};

const testPublicReads = async () => {
  console.log("\nPublic reads still work (the marketing site must not break)");

  await expectStatus("    GET /api/health", "GET", "/api/health", 200);
  await expectStatus("    GET /api/content/menu", "GET", "/api/content/menu", 200);
  for (const resource of ["mainnet", "testnet", "partnership", "about", "team", "products"]) {
    await expectStatus(`    GET /api/${resource}`, "GET", `/api/${resource}`, 200);
  }
};

const testAuthorisedAccess = async () => {
  console.log("\nLegitimate admin access works");

  adminToken = await login(ADMIN);
  record("    Admin can log in", Boolean(adminToken), adminToken ? "token issued" : "no token");
  if (!adminToken) return;

  editorToken = await login(EDITOR);
  record("    Editor can log in", Boolean(editorToken));

  await expectStatus("    Admin GET /api/users", "GET", "/api/users", 200, {
    token: adminToken,
  });
  await expectStatus("    Admin GET /api/auth/me", "GET", "/api/auth/me", 200, {
    token: adminToken,
  });
  await expectStatus("    Admin POST /api/content/menu", "POST", "/api/content/menu", 201, {
    token: adminToken,
    body: { type: "menu", title: "sec_check item", link: "/sec-check", order: 998 },
  });
  await expectStatus("    Editor POST /api/content/menu", "POST", "/api/content/menu", 201, {
    token: editorToken,
    body: { type: "menu", title: "sec_check editor item", link: "/sec-check-2", order: 997 },
  });
};

const testPrivilegeSeparation = async () => {
  console.log("\nRole separation and privilege escalation");
  if (!editorToken || !adminToken) {
    record("    Skipped - login failed", false);
    return;
  }

  await expectStatus("    Editor cannot list users", "GET", "/api/users", 403, {
    token: editorToken,
  });
  await expectStatus("    Editor cannot create users", "POST", "/api/users", 403, {
    token: editorToken,
    body: { username: "eviluser", email: "e@e.com", password: "Password123456!", role: "admin" },
  });

  // Self-service profile update must ignore role even when it is supplied.
  await request("PUT", "/api/users/me", {
    token: editorToken,
    body: { username: EDITOR.username, role: "admin" },
  });
  const editorRecord = await User.findOne({ username: EDITOR.username });
  record(
    "    Editor cannot self-promote via PUT /api/users/me",
    editorRecord?.role === "editor",
    `role is "${editorRecord?.role}"`
  );

  const { status: selfDelete } = await request("DELETE", `/api/users/${adminId}`, {
    token: adminToken,
  });
  record("    Admin cannot delete their own account", selfDelete === 400, `HTTP ${selfDelete}`);
};

const testInputHardening = async () => {
  console.log("\nInput hardening");
  if (!adminToken) {
    record("    Skipped - no admin token", false);
    return;
  }

  // Finding 5: stored XSS payload must not survive as markup. The marker is
  // unique so the assertion cannot accidentally read a different document.
  const marker = "sec_check_xss_marker";
  await request("POST", "/api/content/menu", {
    token: adminToken,
    body: {
      type: "menu",
      title: `${marker}<img src=x onerror=alert(document.domain)>`,
      link: "/",
      order: 999,
    },
  });
  const stored = await Content.findOne({ title: new RegExp(`^${marker}`) });
  const clean =
    stored && !/[<>]/.test(stored.title) && !/onerror/i.test(stored.title);
  record(
    "F5  XSS payload stripped from stored title",
    Boolean(clean),
    stored ? `stored as "${stored.title}"` : "document not found"
  );

  const { status: jsLink } = await request("POST", "/api/content/menu", {
    token: adminToken,
    body: { type: "menu", title: "sec_check js", link: "javascript:alert(1)", order: 996 },
  });
  record("    javascript: link rejected", jsLink === 400, `HTTP ${jsLink}`);

  const { status: badJson } = await request("POST", "/api/auth/login", {
    raw: "{not json",
    token: null,
  });
  record("    Malformed JSON handled cleanly", badJson === 400, `HTTP ${badJson}`);

  // Sending a __proto__ payload over HTTP and then inspecting this process
  // proves nothing - the pollution, if any, happens in the server's memory.
  // The middleware is tested directly instead, in testSanitizerUnit() below.
  await request("POST", "/api/content/menu", {
    token: adminToken,
    rawJson:
      '{"type":"menu","title":"sec_check proto","link":"/p","order":995,' +
      '"__proto__":{"pollutedProto":"yes"}}',
  });
  record(
    "    Server survives a __proto__ payload",
    (await request("GET", "/api/health")).status === 200,
    "still healthy"
  );
};

/**
 * Direct unit test of the sanitiser.
 *
 * Prototype pollution has to be checked where it happens - inside the
 * middleware - not by inspecting this process after an HTTP call. The payload
 * is built with JSON.parse because writing { __proto__: ... } as an object
 * literal sets the prototype instead of creating an own property, so the key
 * would never actually be tested.
 */
const testSanitizerUnit = () => {
  console.log("\nInput sanitiser (direct middleware test)");

  const payload = JSON.parse(
    '{"safe":1,"$ne":null,"nested":{"$gt":5,"keep":2},"a.b":3,' +
      '"__proto__":{"polluted":"yes"},"constructor":{"polluted":"yes"}}'
  );
  const req = { body: payload, params: {}, query: {} };
  let nextCalled = false;
  mongoSanitize(req, {}, () => {
    nextCalled = true;
  });

  const keys = Object.keys(req.body);
  const has = (k) => Object.prototype.hasOwnProperty.call(req.body, k);

  record("    calls next()", nextCalled);
  record("    strips $-prefixed operators", !has("$ne"), keys.join(","));
  record("    strips operators in nested objects", !("$gt" in (req.body.nested || {})));
  record("    strips dotted keys", !has("a.b"));
  record("    strips __proto__", !has("__proto__"));
  record("    strips constructor", !has("constructor"));

  // The decisive check. Without the pollution filter, Object.assign copies the
  // own __proto__ property through the prototype setter and swaps this object's
  // prototype for the attacker's payload.
  const protoIntact = Object.getPrototypeOf(req.body) === Object.prototype;
  record(
    "    object prototype not replaced",
    protoIntact,
    protoIntact ? "Object.prototype" : "PROTOTYPE REPLACED BY PAYLOAD"
  );

  record("    preserves legitimate values", req.body.safe === 1 && req.body.nested?.keep === 2);
};

const testHeaders = async () => {
  console.log("\nResponse headers");
  const { headers } = await request("GET", "/api/health");

  record(
    "F7  x-powered-by header removed",
    !headers.get("x-powered-by"),
    headers.get("x-powered-by") || "absent"
  );
  record(
    "    HSTS present",
    Boolean(headers.get("strict-transport-security")),
    headers.get("strict-transport-security") || "missing"
  );
  record(
    "    X-Content-Type-Options: nosniff",
    headers.get("x-content-type-options") === "nosniff"
  );
  record(
    "    Content-Security-Policy present",
    Boolean(headers.get("content-security-policy"))
  );
};

const testRateLimiting = async () => {
  console.log("\nFinding 8: rate limiting on credential endpoints");

  if (process.env.DISABLE_RATE_LIMIT === "true") {
    record("    Skipped - DISABLE_RATE_LIMIT is set", true, "not a failure");
    return;
  }

  // The allowance differs between production (10) and development (100), so
  // read it from the RateLimit headers instead of hardcoding a loop count.
  const probe = await request("POST", "/api/auth/login", {
    body: { username: "no-such-user", password: "probe" },
  });
  const declared = parseInt(probe.headers.get("ratelimit-limit") || "0", 10);
  const budget = declared > 0 ? declared + 5 : 45;

  let throttled = false;
  let attempts = 1;
  for (let i = 0; i < budget; i += 1) {
    attempts += 1;
    const { status } = await request("POST", "/api/auth/login", {
      body: { username: "no-such-user", password: `attempt-${i}` },
    });
    if (status === 429) {
      throttled = true;
      break;
    }
  }
  record(
    "    Repeated failed logins get throttled (429)",
    throttled,
    throttled ? `after ${attempts} attempts` : "never throttled in 40 attempts"
  );
};

// ---------------------------------------------------------------------------

const run = async () => {
  console.log(`\nStakeCraft API security check`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Database: ${config.mongoUri.replace(/\/\/.*@/, "//***:***@")}`);

  const health = await request("GET", "/api/health");
  if (health.status !== 200) {
    console.error(
      red(`\nCannot reach ${BASE_URL}/api/health (status ${health.status}). Is the server running?\n`)
    );
    process.exit(1);
  }

  // The suite deliberately exhausts the login limiter at the end, and the
  // limiter keeps its counters in memory for the whole 15 minute window. A
  // second run inside that window would report a pile of misleading failures,
  // so detect the state up front and say so plainly.
  const preflight = await request("POST", "/api/auth/login", {
    body: { username: "sec_check_preflight", password: "preflight" },
  });
  if (preflight.status === 429) {
    console.error(
      red("\nThe login rate limiter is still counting down from a previous run.")
    );
    console.error(
      "Restart the server to clear it, or wait for the 15 minute window to expire.\n"
    );
    process.exit(1);
  }

  await seed();

  try {
    await testUnauthenticatedWrites();
    await testAuthBypass();
    await testPublicReads();
    await testAuthorisedAccess();
    await testPrivilegeSeparation();
    await testInputHardening();
    testSanitizerUnit();
    await testHeaders();
    await testRateLimiting();
  } finally {
    await cleanup();
  }

  const failed = results.filter((r) => !r.passed);
  console.log("\n" + "=".repeat(60));
  console.log(`${results.length - failed.length}/${results.length} checks passed`);
  console.log("=".repeat(60) + "\n");

  if (failed.length) {
    console.log(red("Failed checks:"));
    failed.forEach((f) => console.log(red(`  - ${f.name} (${f.detail ?? ""})`)));
    console.log("");
    process.exit(1);
  }
  console.log(green("All security checks passed.\n"));
};

run().catch(async (error) => {
  console.error("\nSecurity check crashed:", error);
  try {
    await mongoose.disconnect();
  } catch {
    /* already closed */
  }
  process.exit(1);
});
