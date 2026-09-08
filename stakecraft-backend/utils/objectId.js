import mongoose from "mongoose";

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

/**
 * Accepts only a 24-char hex string and returns a bson ObjectId.
 * Rejects operator objects such as { $ne: null } before they reach a query.
 */
export const asObjectId = (value) => {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!OBJECT_ID_RE.test(raw)) return null;
  if (!mongoose.Types.ObjectId.isValid(raw)) return null;
  return new mongoose.Types.ObjectId(raw);
};

export const eqString = (value) => ({ $eq: String(value) });

export const eqNumber = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return { $eq: n };
};
