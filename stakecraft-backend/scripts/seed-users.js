import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/stakecraft";

// Sample users data
const users = [
  {
    username: "mahavira",
    email: "mahavira@stakecraft.com",
    password: "admin123",
    role: "admin",
    isActive: true,
  },
  {
    username: "editor1",
    email: "editor1@stakecraft.com",
    password: "editor123",
    role: "editor",
    isActive: true,
  },
  {
    username: "editor2",
    email: "editor2@stakecraft.com",
    password: "editor123",
    role: "editor",
    isActive: true,
  },
  {
    username: "manager",
    email: "manager@stakecraft.com",
    password: "manager123",
    role: "admin",
    isActive: true,
  },
  {
    username: "content_creator",
    email: "content@stakecraft.com",
    password: "content123",
    role: "editor",
    isActive: true,
  },
];

// Connect to database and seed users
async function seedUsers() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing users (except primary admin)
    console.log("🧹 Clearing existing users...");
    await User.deleteMany({ username: { $nin: ["mahavira", "admin"] } });

    // Create users
    console.log("👥 Creating users...");
    const createdUsers = [];

    for (const userData of users) {
      // Skip if primary admin already exists
      if (userData.username === "mahavira") {
        const existingAdmin = await User.findOne({
          $or: [{ username: "mahavira" }, { username: "admin" }, { role: "admin" }],
        });
        if (existingAdmin) {
          console.log("⚠️  Admin user already exists, skipping...");
          continue;
        }
      }

      const user = new User(userData);
      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      createdUsers.push(userResponse);

      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    }

    console.log("✅ Users seeded successfully!");
    console.log(`📊 Total users created: ${createdUsers.length}`);
    console.log("\n📋 User Credentials:");
    console.log("===================");

    users.forEach((user) => {
      console.log(`👤 ${user.username}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
      console.log("---");
    });

    console.log("\n🔐 Login URLs:");
    console.log("==============");
    console.log("Frontend Admin Panel: http://localhost:3000/notadmin");
    console.log("API Base URL: http://localhost:5000/api");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seed function
seedUsers();
