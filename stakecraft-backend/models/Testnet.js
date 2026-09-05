import mongoose from "mongoose";
import { applyIpfsImageTransform } from "../utils/ipfsGateway.js";

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
  isVisible: {
    type: Boolean,
    default: true,
  },
});

// Index for efficient queries
testnetSchema.index({ type: 1, isActive: 1, order: 1 });
applyIpfsImageTransform(testnetSchema);

export default mongoose.model("Testnet", testnetSchema);
