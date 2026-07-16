import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/stakecraft";
const username = process.env.ADMIN_USERNAME || "admin";
const newPassword = process.env.NEW_PASSWORD;

async function resetAdminPassword() {
  if (!newPassword || newPassword.length < 6) {
    console.error(
      "Set NEW_PASSWORD (min 6 chars), e.g.\n  NEW_PASSWORD='your-new-pass' node scripts/reset-admin-password.js"
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      console.error(`No user found for "${username}"`);
      process.exit(1);
    }

    user.password = newPassword;
    user.isActive = true;
    await user.save();

    console.log(`✅ Password reset for ${user.username} (${user.role})`);
  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

resetAdminPassword();
