import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: "",
      trim: true,
    },
    explanation: {
      type: String,
      default: "",
    },
    /** Full IPFS gateway URLs or raw CIDs — stored as returned from Pinata upload */
    images: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ order: 1, createdAt: -1 });
productSchema.index({ isActive: 1 });

export default mongoose.model("Product", productSchema);
