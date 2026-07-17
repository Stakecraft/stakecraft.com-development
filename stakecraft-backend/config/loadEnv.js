import { existsSync } from "fs";
import dotenv from "dotenv";

/**
 * Load env files the same way the server does, with a fallback so CLI scripts
 * still find MONGODB_URI when NODE_ENV is unset.
 */
export function loadEnv() {
  dotenv.config();

  const preferred =
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development";

  if (existsSync(preferred)) {
    dotenv.config({ path: preferred, override: true });
  }

  if (!process.env.MONGODB_URI) {
    for (const file of [".env.development", ".env.production", ".env"]) {
      if (!existsSync(file)) continue;
      dotenv.config({ path: file });
      if (process.env.MONGODB_URI) break;
    }
  }
}

export function getMongoUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGODB_URI_PRODUCTION ||
    "mongodb://localhost:27017/stakecraft"
  );
}
