import mongoose from "mongoose";

const partnershipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
partnershipSchema.index({ type: 1, isActive: 1, order: 1 });

export default mongoose.model("Partnership", partnershipSchema);
