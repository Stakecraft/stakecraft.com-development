import mongoose from "mongoose";

const testnetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
});

// Index for efficient queries
testnetSchema.index({ type: 1, isActive: 1, order: 1 });

export default mongoose.model("Testnet", testnetSchema);
