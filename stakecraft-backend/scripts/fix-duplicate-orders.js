import dotenv from "dotenv";
import { connectDB } from "../config/database.js";
import Content from "../models/Content.js";
import Mainnet from "../models/Mainnet.js";
import Testnet from "../models/Testnet.js";

// Load environment variables
dotenv.config();

const fixDuplicateOrders = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Fix Content (Menu) items
    console.log("\n🔧 Fixing Content (Menu) items...");
    const contentTypes = [
      "menu",
      "mainnet",
      "testnet",
      "partnership",
      "about",
      "team",
    ];

    for (const type of contentTypes) {
      const items = await Content.find({ type }).sort({ createdAt: 1 });

      if (items.length > 0) {
        console.log(`Processing ${items.length} ${type} items...`);

        for (let i = 0; i < items.length; i++) {
          const newOrder = i + 1;
          if (items[i].order !== newOrder) {
            await Content.findByIdAndUpdate(items[i]._id, { order: newOrder });
            console.log(
              `  Updated ${type} "${items[i].title}" order: ${items[i].order} → ${newOrder}`
            );
          }
        }
      }
    }

    // Fix Mainnet items
    console.log("\n🔧 Fixing Mainnet items...");
    const mainnetItems = await Mainnet.find({}).sort({ createdAt: 1 });

    if (mainnetItems.length > 0) {
      console.log(`Processing ${mainnetItems.length} mainnet items...`);

      for (let i = 0; i < mainnetItems.length; i++) {
        const newOrder = i + 1;
        if (mainnetItems[i].order !== newOrder) {
          await Mainnet.findByIdAndUpdate(mainnetItems[i]._id, {
            order: newOrder,
          });
          console.log(
            `  Updated mainnet "${mainnetItems[i].title}" order: ${mainnetItems[i].order} → ${newOrder}`
          );
        }
      }
    }

    // Fix Testnet items
    console.log("\n🔧 Fixing Testnet items...");
    const testnetItems = await Testnet.find({}).sort({ createdAt: 1 });

    if (testnetItems.length > 0) {
      console.log(`Processing ${testnetItems.length} testnet items...`);

      for (let i = 0; i < testnetItems.length; i++) {
        const newOrder = i + 1;
        if (testnetItems[i].order !== newOrder) {
          await Testnet.findByIdAndUpdate(testnetItems[i]._id, {
            order: newOrder,
          });
          console.log(
            `  Updated testnet "${testnetItems[i].title}" order: ${testnetItems[i].order} → ${newOrder}`
          );
        }
      }
    }

    console.log("\n✅ Successfully fixed all duplicate order numbers!");
    console.log(
      "\nNow each item type has unique, sequential order numbers starting from 1."
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing duplicate orders:", error);
    process.exit(1);
  }
};

fixDuplicateOrders();
