import mongoose from "mongoose";

const mainnetSchema = new mongoose.Schema(
  {
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
      // required: true,
    },
    validator: {
      type: String,
    },
    howToStake: {
      type: String,
    },
    explorer: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
mainnetSchema.index({ type: 1, isActive: 1, order: 1 });

export default mongoose.model("Mainnet", mainnetSchema);
