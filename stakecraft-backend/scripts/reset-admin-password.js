import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/stakecraft";
const targetUsername = process.env.ADMIN_USERNAME || "mahavira";
const newPassword = process.env.NEW_PASSWORD;
const fromUsername = process.env.FROM_USERNAME || "admin";

async function resetAdminPassword() {
  try {
    await mongoose.connect(MONGODB_URI);

    let user =
      (await User.findOne({ username: targetUsername })) ||
      (await User.findOne({ username: fromUsername })) ||
      (await User.findOne({ role: "admin" }));

    if (!user) {
      if (!newPassword || newPassword.length < 6) {
        console.error(
          `No admin found. Create one with:\n  NEW_PASSWORD='your-pass' node scripts/reset-admin-password.js`
        );
        process.exit(1);
      }

      user = new User({
        username: targetUsername,
        email: `${targetUsername}@stakecraft.com`,
        password: newPassword,
        role: "admin",
        isActive: true,
      });
      await user.save();
      console.log(`✅ Created admin user: ${user.username}`);
      return;
    }

    if (user.username !== targetUsername) {
      const taken = await User.findOne({ username: targetUsername });
      if (taken && String(taken._id) !== String(user._id)) {
        console.error(`Username "${targetUsername}" is already taken`);
        process.exit(1);
      }
      const previous = user.username;
      user.username = targetUsername;
      console.log(`✅ Renamed user "${previous}" → "${targetUsername}"`);
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        console.error("NEW_PASSWORD must be at least 6 characters");
        process.exit(1);
      }
      user.password = newPassword;
      console.log(`✅ Password updated for ${targetUsername}`);
    }

    user.isActive = true;
    user.role = "admin";
    await user.save();

    console.log(`✅ Admin ready: username=${user.username} role=${user.role}`);
    if (!newPassword) {
      console.log(
        "(Password unchanged. Set NEW_PASSWORD=... to reset it.)"
      );
    }
  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

resetAdminPassword();
