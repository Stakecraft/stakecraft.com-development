import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["menu", "mainnet", "testnet", "partnership", "about", "team"],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      url: String,
      alt: String,
      filename: String,
    },
    link: {
      type: String,
      trim: true,
    },
    stakeCode: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Map,
      of: String,
    },
    // For team members
    teamMember: {
      name: String,
      position: String,
      bio: String,
      socialLinks: {
        linkedin: String,
        twitter: String,
        github: String,
      },
    },
    // For partnerships
    partnership: {
      icon: String,
      name: String,
      description: String,
      website: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
contentSchema.index({ type: 1, isActive: 1, order: 1 });

export default mongoose.model("Content", contentSchema);
