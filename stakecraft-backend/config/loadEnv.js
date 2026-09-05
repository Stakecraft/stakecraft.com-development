import { loadEnvFiles } from "./loadEnvFiles.js";

/**
 * Load env files the same way the server does, so CLI scripts see PINATA_JWT
 * and MONGODB_URI even when NODE_ENV is unset on the production host.
 */
export function loadEnv() {
  loadEnvFiles();
}

export function getMongoUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGODB_URI_PRODUCTION ||
    "mongodb://localhost:27017/stakecraft"
  );
}
