#!/usr/bin/env node
/**
 * Creates or rotates an administrator account.
 *
 * This runs on the server, over your existing shell access, so no public
 * account-creation endpoint has to exist for bootstrapping. It replaces the
 * internet-reachable POST /api/auth/setup route as the supported path.
 *
 * Usage:
 *   npm run create-admin                      interactive prompts
 *   npm run create-admin -- --username alice --email alice@stakecraft.com
 *
 * The password is read from the ADMIN_PASSWORD environment variable when set,
 * otherwise it is prompted for with echo disabled. It is never passed as a
 * command-line argument, which would place it in the shell history and in the
 * process list where any other user on the box can read it.
 */
import mongoose from "mongoose";
import readline from "readline";
import { Writable } from "stream";
import config from "../config/env.js";
import User from "../models/User.js";

const MIN_PASSWORD_LENGTH = 12;

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i += 1) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith("--")) {
        parsed[key] = value;
        i += 1;
      } else {
        parsed[key] = true;
      }
    }
  }
  return parsed;
};

const ask = (question, { silent = false } = {}) =>
  new Promise((resolve) => {
    // A muted output stream keeps the password off the terminal.
    const mutable = new Writable({
      write(chunk, encoding, callback) {
        if (!silent || !mutable.muted) process.stdout.write(chunk, encoding);
        callback();
      },
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: mutable,
      terminal: true,
    });

    process.stdout.write(question);
    mutable.muted = silent;

    rl.question("", (answer) => {
      mutable.muted = false;
      if (silent) process.stdout.write("\n");
      rl.close();
      resolve(answer.trim());
    });
  });

const fail = (message) => {
  console.error(`\nError: ${message}\n`);
  process.exit(1);
};

const run = async () => {
  const args = parseArgs();

  console.log(`\nStakeCraft admin setup [${config.nodeEnv}]`);
  console.log(`Database: ${config.mongoUri.replace(/\/\/.*@/, "//***:***@")}\n`);

  const username = args.username || (await ask("Username: "));
  if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
    fail("Username must be 3-30 characters (letters, numbers, . _ -).");
  }

  const email = args.email || (await ask("Email: "));
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    fail("A valid email address is required.");
  }

  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = await ask("Password (hidden): ", { silent: true });
    const confirm = await ask("Confirm password: ", { silent: true });
    if (password !== confirm) fail("Passwords do not match.");
  }

  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  await mongoose.connect(config.mongoUri);

  try {
    const existing = await User.findOne({
      $or: [{ username }, { email: email.toLowerCase() }],
    });

    if (existing) {
      // Rotating an existing account is the normal response to a suspected
      // compromise, so allow it rather than forcing a manual database edit.
      existing.password = password; // hashed by the model's pre-save hook
      existing.role = "admin";
      existing.isActive = true;
      existing.email = email.toLowerCase();
      await existing.save();
      console.log(`\nUpdated existing account "${username}" (role: admin).`);
    } else {
      await User.create({
        username,
        email: email.toLowerCase(),
        password,
        role: "admin",
        isActive: true,
      });
      console.log(`\nCreated admin account "${username}".`);
    }

    const adminCount = await User.countDocuments({ role: "admin", isActive: true });
    console.log(`Active admin accounts: ${adminCount}`);
    console.log(
      "\nConfirm ALLOW_PUBLIC_SETUP is unset or false before exposing the API.\n"
    );
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error("\nFailed to create admin:", error.message);
  process.exit(1);
});
