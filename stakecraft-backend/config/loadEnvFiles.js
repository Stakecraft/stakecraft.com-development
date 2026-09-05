import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const exists = (cwd, name) => fs.existsSync(path.join(cwd, name));

/**
 * Prod is often started as `node server.js` with NODE_ENV unset. This repo
 * then used to default to "development" and never open .env.production.
 * If the host has .env.production and no .env.development, that is production.
 */
export const resolveNodeEnv = (cwd = process.cwd()) => {
  const explicit = (process.env.NODE_ENV || "").trim();
  if (explicit) return explicit;
  if (exists(cwd, ".env.production") && !exists(cwd, ".env.development")) {
    return "production";
  }
  return "development";
};

const applyFile = (cwd, filename) => {
  const file = path.join(cwd, filename);
  if (!fs.existsSync(file)) return;
  const parsed = dotenv.parse(fs.readFileSync(file));
  for (const [key, value] of Object.entries(parsed)) {
    const incoming = String(value ?? "").trim();
    if (!incoming) continue;
    const current = process.env[key];
    if (current === undefined || String(current).trim() === "") {
      process.env[key] = incoming;
    }
  }
};

/**
 * Load `.env` then `.env.${NODE_ENV}`. Empty assignments (PINATA_JWT=) do not
 * block a real value in the other file. Non-empty process env always wins.
 */
export const loadEnvFiles = (cwd = process.cwd()) => {
  const nodeEnv = resolveNodeEnv(cwd);
  if (!(process.env.NODE_ENV || "").trim()) {
    process.env.NODE_ENV = nodeEnv;
  }
  applyFile(cwd, ".env");
  applyFile(cwd, `.env.${nodeEnv}`);
  return nodeEnv;
};
