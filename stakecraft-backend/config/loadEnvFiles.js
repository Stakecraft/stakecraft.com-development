import dotenv from "dotenv";
import fs from "fs";
import path from "path";

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
 */
export const resolveNodeEnv = () => {
  const explicit = (process.env.NODE_ENV || "").trim();
  return explicit || "development";
};

const applyFile = (cwd, filename) => {
  const file = path.join(cwd, filename);
  if (!fs.existsSync(file)) return false;
  const parsed = dotenv.parse(fs.readFileSync(file));
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

export const loadEnvFiles = (cwd = process.cwd()) => {
  const nodeEnv = resolveNodeEnv();
  process.env.NODE_ENV = nodeEnv;

  const loaded = [];
  if (applyFile(cwd, ".env")) loaded.push(".env");
  if (applyFile(cwd, `.env.${nodeEnv}`)) loaded.push(`.env.${nodeEnv}`);

  if (nodeEnv !== "test") {
    console.log(
      `Loaded env [${nodeEnv}]: ${loaded.length ? loaded.join(", ") : "(no env files)"}`
    );
  }

  return nodeEnv;
};
