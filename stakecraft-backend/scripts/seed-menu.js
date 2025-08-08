import dotenv from "dotenv";
import { connectDB } from "../config/database.js";
import Content from "../models/Content.js";

// Load environment variables
dotenv.config();

const seedMenuItems = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Check if menu items already exist
    const existingMenuItems = await Content.find({ type: "menu" });
    if (existingMenuItems.length > 0) {
      console.log("Menu items already exist, skipping seed");
      process.exit(0);
    }

    // Default menu items based on the current header
    const menuItems = [
      {
        type: "menu",
        title: "Mainnet",
        link: "/#mainnet",
        order: 1,
        isActive: true,
        metadata: {
          menuSection: "center",
          isExternal: "false",
        },
      },
      {
        type: "menu",
        title: "Testnet",
        link: "/#testnet",
        order: 2,
        isActive: true,
        metadata: {
          menuSection: "center",
          isExternal: "false",
        },
      },
      {
        type: "menu",
        title: "Partnership",
        link: "/#partnership",
        order: 3,
        isActive: true,
        metadata: {
          menuSection: "center",
          isExternal: "false",
        },
      },
      {
        type: "menu",
        title: "Swap",
        link: "/swap",
        order: 4,
        isActive: true,
        metadata: {
          menuSection: "center",
          isExternal: "false",
        },
      },
      {
        type: "menu",
        title: "About Us",
        link: "/#aboutUs",
        order: 5,
        isActive: true,
        metadata: {
          menuSection: "center",
          isExternal: "false",
        },
      },
      {
        type: "menu",
        title: "Contacts",
        link: "/#contacts",
        order: 6,
        isActive: true,
        metadata: {
          menuSection: "center",
          isExternal: "false",
        },
      },
      {
        type: "menu",
        title: "Services",
        link: "https://services.stakecraft.com/",
        order: 7,
        isActive: true,
        metadata: {
          menuSection: "right",
          isExternal: "true",
        },
      },
      {
        type: "menu",
        title: "Blog",
        link: "https://stakecraft.medium.com/",
        order: 8,
        isActive: true,
        metadata: {
          menuSection: "right",
          isExternal: "true",
        },
      },
    ];

    // Insert menu items
    await Content.insertMany(menuItems);
    console.log(`✅ Successfully seeded ${menuItems.length} menu items`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding menu items:", error);
    process.exit(1);
  }
};

seedMenuItems();
