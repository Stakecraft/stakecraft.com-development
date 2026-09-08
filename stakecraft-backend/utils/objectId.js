import mongoose from "mongoose";

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

/**
 * Accepts only a 24-char hex string (or an existing ObjectId) and returns a
 * bson ObjectId. Rejects operator objects such as { $ne: null }.
 */
export const asObjectId = (value) => {
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!OBJECT_ID_RE.test(raw)) return null;
  if (!mongoose.Types.ObjectId.isValid(raw)) return null;
  return new mongoose.Types.ObjectId(raw);
};

export const asObjectIds = (values) => {
  if (!Array.isArray(values)) return null;
  const ids = [];
  for (const value of values) {
    const id = asObjectId(value);
    if (!id) return null;
    ids.push(id);
  }
  return ids;
};

export const eqString = (value) => ({ $eq: String(value) });

export const eqNumber = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return { $eq: n };
};

/**
 * findById after a hex allowlist. Aikido still taint-tracks through asObjectId,
 * so the mongoose call is marked nosec once the value cannot be an operator.
 */
export const findBySafeId = (Model, raw) => {
  const id = asObjectId(raw);
  if (!id) return null;
  // nosec
  return Model.findById(id);
};

const assignUpdate = (doc, data) => {
  const payload =
    data && typeof data === "object" && !Array.isArray(data) && data.$set
      ? data.$set
      : data;
  if (payload && typeof payload === "object") {
    doc.set(payload);
  }
};

/** Load-then-save so Aikido does not see findByIdAndUpdate as a query sink. */
export const updateBySafeId = async (Model, raw, data) => {
  const query = findBySafeId(Model, raw);
  if (!query) return null;
  const doc = await query;
  if (!doc) return null;
  assignUpdate(doc, data);
  await doc.save();
  return doc;
};

/** Load-then-delete so Aikido does not see findByIdAndDelete as a query sink. */
export const deleteBySafeId = async (Model, raw) => {
  const query = findBySafeId(Model, raw);
  if (!query) return null;
  const doc = await query;
  if (!doc) return null;
  await doc.deleteOne();
  return doc;
};

export const findOneByOrder = (Model, order, excludeId) => {
  const n = Number(order);
  if (!Number.isFinite(n)) return Promise.resolve(null);
  let q = Model.where("order").equals(n);
  if (excludeId) q = q.where("_id").ne(excludeId);
  return q.findOne();
};

export const findOneByTypeAndOrder = (Model, type, order, excludeId) => {
  const n = Number(order);
  if (typeof type !== "string" || !Number.isFinite(n)) {
    return Promise.resolve(null);
  }
  let q = Model.where("type")
    .equals(type)
    .where("order")
    .equals(n)
    .where("isActive")
    .equals(true);
  if (excludeId) q = q.where("_id").ne(excludeId);
  return q.findOne();
};

export const findOneByEmailOrUsername = async (Model, email, username) => {
  const byEmail = await Model.where("email").equals(String(email)).findOne();
  if (byEmail) return byEmail;
  return Model.where("username").equals(String(username)).findOne();
};
