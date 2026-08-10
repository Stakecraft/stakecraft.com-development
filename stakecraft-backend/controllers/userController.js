import mongoose from "mongoose";
import User from "../models/User.js";
import { body, validationResult } from "express-validator";

const MIN_PASSWORD_LENGTH = 12;

/**
 * Shared guard for the validation chains declared at the bottom of this file.
 * The previous version imported the chains but never ran them, and the check
 * inside createUser was commented out, so nothing was validated at all.
 */
const rejectOnValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
    return true;
  }
  return false;
};

/**
 * Error responses must not echo driver or stack detail to the client: Mongo
 * errors leak collection names, index definitions and sometimes field values.
 */
const failed = (res, action, error, status = 500) => {
  console.error(`${action}:`, error);
  return res.status(status).json({ success: false, message: action });
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return failed(res, "Failed to fetch users", error);
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return failed(res, "Failed to fetch user", error);
  }
};

// Create new user (admin only - enforced by the route)
export const createUser = async (req, res) => {
  try {
    if (rejectOnValidationErrors(req, res)) return;

    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Only an admin can mint another admin. The route already requires admin,
    // so this is the second of two independent checks rather than the only one.
    const requestedRole = role === "admin" ? "admin" : "editor";
    if (requestedRole === "admin" && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only an admin may create admin accounts",
      });
    }

    const user = new User({
      username,
      email,
      password,
      role: requestedRole,
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }
    return failed(res, "Failed to create user", error);
  }
};

// Update user (admin only - enforced by the route)
export const updateUser = async (req, res) => {
  try {
    if (rejectOnValidationErrors(req, res)) return;

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const { username, email, role, isActive } = req.body;

    // Build the update from an explicit allow-list. Passing req.body straight
    // through would let a caller set "password" (bypassing the hashing hook,
    // storing it in the clear) or any other schema field.
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (role !== undefined) {
      if (!["admin", "editor"].includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role" });
      }
      updateData.role = role;
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isSelf = req.user._id.toString() === target._id.toString();

    // Guard against an admin locking the platform out of itself: the last
    // active admin cannot be demoted or deactivated.
    const losingAdmin =
      target.role === "admin" &&
      ((updateData.role && updateData.role !== "admin") ||
        updateData.isActive === false);

    if (losingAdmin) {
      const activeAdmins = await User.countDocuments({
        role: "admin",
        isActive: true,
        _id: { $ne: target._id },
      });
      if (activeAdmins === 0) {
        return res.status(409).json({
          success: false,
          message: "Cannot demote or deactivate the last active admin",
        });
      }
    }

    // Removing your own admin rights mid-session is almost always a mistake
    // and cannot be undone without another admin.
    if (isSelf && updateData.role && updateData.role !== req.user.role) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Username or email already in use",
      });
    }
    return failed(res, "Failed to update user", error);
  }
};

// Delete user (admin only - enforced by the route)
export const deleteUser = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Deleting yourself ends your own session and may strand the platform.
    if (req.user._id.toString() === target._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // The reported lockout scenario: enumerate the admin, delete the admin,
    // nobody can administer the site again. Refuse to remove the last one.
    if (target.role === "admin") {
      const otherAdmins = await User.countDocuments({
        role: "admin",
        isActive: true,
        _id: { $ne: target._id },
      });
      if (otherAdmins === 0) {
        return res.status(409).json({
          success: false,
          message: "Cannot delete the last active admin",
        });
      }
    }

    await User.findByIdAndDelete(target._id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return failed(res, "Failed to delete user", error);
  }
};

// Change user password. The route allows self or admin; the two cases differ.
export const changePassword = async (req, res) => {
  try {
    if (rejectOnValidationErrors(req, res)) return;

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isSelf = req.user._id.toString() === user._id.toString();

    // Changing your own password requires proving you know the current one,
    // so a stolen session alone cannot lock the real owner out. An admin
    // performing a reset for someone else is not expected to know it.
    if (isSelf) {
      const isPasswordValid = await user.comparePassword(currentPassword || "");
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from the current password",
        });
      }
    }

    user.password = newPassword; // hashed by the pre-save hook
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return failed(res, "Failed to change password", error);
  }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return failed(res, "Failed to fetch user profile", error);
  }
};

// Update current user profile. Deliberately limited to username and email -
// role and isActive are not self-serviceable, or any user could self-promote.
export const updateCurrentUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Username or email already in use",
      });
    }
    return failed(res, "Failed to update profile", error);
  }
};

/**
 * Rejects the most obvious credential-stuffing targets. Length does most of
 * the work; this only removes passwords that appear in every wordlist.
 */
const isWeakPassword = (value) => {
  const lowered = String(value).toLowerCase();
  const banned = [
    "password",
    "12345678",
    "qwerty",
    "letmein",
    "admin123",
    "stakecraft",
    "changeme",
  ];
  return banned.some((word) => lowered.includes(word));
};

const passwordRule = (field) =>
  body(field)
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: MIN_PASSWORD_LENGTH, max: 200 })
    .withMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`)
    .custom((value) => {
      if (isWeakPassword(value)) {
        throw new Error("Password is too common, choose a less predictable one");
      }
      return true;
    });

// Validation middleware for user creation.
// isString() on every field matters as much as the length checks: it rejects
// object payloads such as {"$ne": null} before they reach a query.
export const validateUserCreation = [
  body("username")
    .isString()
    .withMessage("Username must be a string")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage("Username may contain letters, numbers, dot, underscore and hyphen"),
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  passwordRule("password"),
  body("role")
    .optional()
    .isIn(["admin", "editor"])
    .withMessage("Role must be either admin or editor"),
];

// Validation middleware for user update
export const validateUserUpdate = [
  body("username")
    .optional()
    .isString()
    .withMessage("Username must be a string")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage("Username may contain letters, numbers, dot, underscore and hyphen"),
  body("email")
    .optional()
    .isString()
    .withMessage("Email must be a string")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("role")
    .optional()
    .isIn(["admin", "editor"])
    .withMessage("Role must be either admin or editor"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];

// Validation middleware for password change
export const validatePasswordChange = [
  body("currentPassword").optional().isString(),
  passwordRule("newPassword"),
];
