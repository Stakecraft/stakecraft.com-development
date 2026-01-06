import mongoose from "mongoose";
import dotenv from "dotenv";

// Ensure environment variables are loaded
// dotenv.config();

// Load the appropriate .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';
dotenv.config({ path: envFile });

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.MONGODB_URI_PRODUCTION ||
  "mongodb://localhost:27017/stakecraft";

console.log("🔗 Connecting to MongoDB...");
console.log("Database URI:", mongoUri.replace(/\/\/.*@/, "//***:***@")); // Hide credentials in logs

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, clientOptions);
    await mongoose.connection.asPromise();
    await mongoose.connection.db.admin().command({ ping: 1 });

    console.log("✅ Connected to MongoDB successfully!");
    console.log("📊 Database:", mongoose.connection.name);
    console.log("🌐 Host:", mongoose.connection.host);
    console.log("🔌 Port:", mongoose.connection.port);
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("🔍 Error details:", error);

    if (error.name === "MongoParseError") {
      console.error("💡 Tip: Check your MONGODB_URI format in .env file");
      console.error(
        "   Expected format: mongodb+srv://username:password@cluster.mongodb.net/database"
      );
    } else if (error.name === "MongoNetworkError") {
      console.error(
        "💡 Tip: Check your network access and IP whitelist in MongoDB Atlas"
      );
    } else if (error.name === "MongoServerSelectionError") {
      console.error(
        "💡 Tip: Check if your MongoDB cluster is running and accessible"
      );
    }

    throw error;
  }
};
