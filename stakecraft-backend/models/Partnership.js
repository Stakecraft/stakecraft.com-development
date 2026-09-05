import mongoose from "mongoose";
import { applyIpfsImageTransform } from "../utils/ipfsGateway.js";

const partnershipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
partnershipSchema.index({ type: 1, isActive: 1, order: 1 });
applyIpfsImageTransform(partnershipSchema);

export default mongoose.model("Partnership", partnershipSchema);
