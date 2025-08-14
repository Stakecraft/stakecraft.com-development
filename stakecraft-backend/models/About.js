import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
aboutSchema.index({ isActive: 1 });

export default mongoose.model("About", aboutSchema);
