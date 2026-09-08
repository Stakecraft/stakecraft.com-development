import dotenv from "dotenv";
import fs from "fs";

/**
 * Same codebase for every host. Which secrets you get is decided only by
 * NODE_ENV (systemd Environment=, npm start / npm run dev) plus the matching
 * file:
 *
 *   NODE_ENV=production  → .env then .env.production
 *   NODE_ENV=development → .env then .env.development
 *
 * Non-empty process env (the unit file) always wins. Empty assignments like
 * PINATA_JWT= in one file do not hide a real value in the other.
 *
 * Each read uses a string literal so a tainted NODE_ENV cannot reach fs.
 */
export const resolveNodeEnv = () => {
  const explicit = (process.env.NODE_ENV || "").trim();
  return explicit || "development";
};

const readLiteralEnv = (filename) => {
  switch (filename) {
    case ".env":
      return fs.existsSync(".env") ? fs.readFileSync(".env") : null;
    case ".env.production":
      return fs.existsSync(".env.production")
        ? fs.readFileSync(".env.production")
        : null;
    case ".env.development":
      return fs.existsSync(".env.development")
        ? fs.readFileSync(".env.development")
        : null;
    case ".env.test":
      return fs.existsSync(".env.test") ? fs.readFileSync(".env.test") : null;
    default:
      return null;
  }
};

const applyFile = (filename) => {
  const raw = readLiteralEnv(filename);
  if (raw == null) return false;
  const parsed = dotenv.parse(raw);
  for (const [key, value] of Object.entries(parsed)) {
    const incoming = String(value ?? "").trim();
    if (!incoming) continue;
    const current = process.env[key];
    if (current === undefined || String(current).trim() === "") {
      process.env[key] = incoming;
    }
  }
  return true;
};

export const loadEnvFiles = () => {
  const nodeEnv = resolveNodeEnv();
  process.env.NODE_ENV = nodeEnv;

  const overlay =
    nodeEnv === "production"
      ? ".env.production"
      : nodeEnv === "test"
        ? ".env.test"
        : nodeEnv === "development"
          ? ".env.development"
          : null;

  const loaded = [];
  if (applyFile(".env")) loaded.push(".env");
  if (overlay && applyFile(overlay)) loaded.push(overlay);

  if (nodeEnv !== "test") {
    console.log(
      `Loaded env [${nodeEnv}]: ${loaded.length ? loaded.join(", ") : "(no env files)"}`
    );
  }

  return nodeEnv;
};
