#!/usr/bin/env node
/**
 * Route authorisation audit.
 *
 * Walks every Express router in the application and reports, per route,
 * whether `authenticateToken` and a role guard are actually present in its
 * handler chain. Detection is by function reference, not by name, so a
 * look-alike wrapper cannot make an unprotected route appear protected.
 *
 * Exits non-zero if any state-changing route (POST/PUT/PATCH/DELETE) is
 * reachable without authentication. Run it in CI to stop the original bug -
 * middleware imported but never applied - from coming back.
 *
 *   npm run audit:routes
 */
import {
  authenticateToken,
  requireAdmin,
  requireEditor,
  requireSelfOrAdmin,
} from "../middleware/auth.js";

import contentRoutes from "../routes/content.js";
import userRoutes from "../routes/users.js";
import authRoutes from "../routes/auth.js";
import adminRoutes from "../routes/admin.js";
import uploadRoutes from "../routes/upload.js";
import mainnetRouter from "../routes/mainnet.js";
import testnetRouter from "../routes/testnet.js";
import partnershipRouter from "../routes/partnership.js";
import aboutRouter from "../routes/about.js";
import teamRouter from "../routes/team.js";
import productRouter from "../routes/product.js";
import solanaRouter from "../routes/solana.js";

// Mount points must mirror server.js.
const MOUNTS = [
  ["/api/auth", authRoutes],
  ["/api/admin", adminRoutes],
  ["/api/upload", uploadRoutes],
  ["/api/content", contentRoutes],
  ["/api/users", userRoutes],
  ["/api/mainnet", mainnetRouter],
  ["/api/testnet", testnetRouter],
  ["/api/partnership", partnershipRouter],
  ["/api/about", aboutRouter],
  ["/api/team", teamRouter],
  ["/api/products", productRouter],
  ["/api/solana", solanaRouter],
];

// Routes that are intentionally public. Anything reaching the internet without
// authentication should be a deliberate, listed decision.
const INTENTIONALLY_PUBLIC = new Set([
  "POST /api/auth/login", // the credential exchange itself
  "POST /api/auth/setup", // gated by ALLOW_PUBLIC_SETUP, 404 by default
]);

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const ROLE_GUARDS = new Map([
  [requireAdmin, "admin"],
  [requireEditor, "editor+"],
  [requireSelfOrAdmin, "self|admin"],
]);

const colour = (code, text) =>
  process.stdout.isTTY ? `[${code}m${text}[0m` : text;
const green = (t) => colour(32, t);
const red = (t) => colour(31, t);
const yellow = (t) => colour(33, t);
const dim = (t) => colour(90, t);

const collect = (router, mount) => {
  const found = [];

  // Middleware applied with router.use() has no .route and applies to every
  // route registered after it - this is how routes/users.js protects itself.
  const routerLevel = router.stack
    .filter((layer) => !layer.route && typeof layer.handle === "function")
    .map((layer) => layer.handle);

  for (const layer of router.stack) {
    if (!layer.route) continue;

    const path = layer.route.path;
    const handlers = layer.route.stack.map((s) => s.handle);
    const chain = [...routerLevel, ...handlers];

    for (const method of Object.keys(layer.route.methods)) {
      if (method === "_all") continue;
      found.push({
        method: method.toUpperCase(),
        path: `${mount}${path === "/" ? "" : path}` || "/",
        authenticated: chain.includes(authenticateToken),
        role: [...ROLE_GUARDS.entries()]
          .filter(([fn]) => chain.includes(fn))
          .map(([, label]) => label)
          .join(",") || "-",
      });
    }
  }

  return found;
};

const routes = MOUNTS.flatMap(([mount, router]) => collect(router, mount));

routes.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

console.log("\nRoute authorisation audit\n");
console.log(
  `  ${"METHOD".padEnd(7)}${"PATH".padEnd(38)}${"AUTH".padEnd(7)}${"ROLE".padEnd(11)}STATUS`
);
console.log("  " + "-".repeat(78));

const failures = [];

for (const route of routes) {
  const key = `${route.method} ${route.path}`;
  const mutating = MUTATING.has(route.method);
  const allowedPublic = INTENTIONALLY_PUBLIC.has(key);

  let status;
  if (route.authenticated) {
    status = green("protected");
  } else if (allowedPublic) {
    status = yellow("public (intentional)");
  } else if (mutating) {
    status = red("UNPROTECTED WRITE");
    failures.push(key);
  } else {
    status = dim("public read");
  }

  console.log(
    `  ${route.method.padEnd(7)}${route.path.padEnd(38)}` +
      `${(route.authenticated ? "yes" : "no").padEnd(7)}${route.role.padEnd(11)}${status}`
  );
}

const writes = routes.filter((r) => MUTATING.has(r.method));
const protectedWrites = writes.filter((r) => r.authenticated);

console.log("\n" + "=".repeat(80));
console.log(
  `  ${routes.length} routes | ${writes.length} state-changing | ` +
    `${protectedWrites.length} of those authenticated`
);
console.log("=".repeat(80) + "\n");

if (failures.length) {
  console.log(red("Unprotected state-changing routes:"));
  failures.forEach((f) => console.log(red(`  - ${f}`)));
  console.log("");
  process.exit(1);
}

console.log(green("Every state-changing route requires authentication.\n"));
