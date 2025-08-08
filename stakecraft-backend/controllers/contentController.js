import Content from "../models/Content.js";
import { body, validationResult } from "express-validator";
import { deleteFile, ensureUploadsDir } from "../utils/upload.js";

// Get all content with pagination and filtering
export const getAllContent = async (req, res) => {
  try {
    const {
      type,
      page = 1,
      limit = 20,
      search,
      isActive,
      sortBy = "order",
      sortOrder = "asc",
    } = req.query;

    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const content = await Content.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Content.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: content,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch content",
      error: error.message,
    });
  }
};

// Get content by type
export const getContentByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { isActive = "true" } = req.query;

    const filter = { type };
    if (isActive !== "all") {
      filter.isActive = isActive === "true";
    }

    const content = await Content.find(filter).sort({
      order: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: content.length,
      data: content,
    });
  } catch (error) {
    console.error("Error fetching content by type:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch content",
      error: error.message,
    });
  }
};

// Get single content by ID
export const getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch content",
      error: error.message,
    });
  }
};

// Create new content
export const createContent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      type,
      title,
      description,
      link,
      stakeCode,
      order,
      isActive = true,
      metadata,
      teamMember,
      partnership,
    } = req.body;

    // Handle image upload
    let imageData = null;
    if (req.file) {
      imageData = {
        url: `/uploads/${req.file.filename}`,
        alt: req.body.imageAlt || title,
        filename: req.file.filename,
      };
    }

    // Check for duplicate order within the same type
    if (order !== undefined && order !== null) {
      const existingWithOrder = await Content.findOne({
        type,
        order: order,
        isActive: true,
      });

      if (existingWithOrder) {
        return res.status(400).json({
          success: false,
          message: `Order ${order} is already taken for ${type} items. Please choose a different order number.`,
          error: "DUPLICATE_ORDER",
        });
      }
    }

    // Create content object
    const contentData = {
      type,
      title,
      description,
      link,
      stakeCode,
      order: order || 0,
      isActive,
      metadata: metadata ? new Map(Object.entries(metadata)) : undefined,
      teamMember,
      partnership,
    };

    if (imageData) {
      contentData.image = imageData;
    }

    const content = new Content(contentData);
    await content.save();

    res.status(201).json({
      success: true,
      message: "Content created successfully",
      data: content,
    });
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create content",
      error: error.message,
    });
  }
};

// Update content
export const updateContent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const {
      type,
      title,
      description,
      link,
      stakeCode,
      order,
      isActive,
      metadata,
      teamMember,
      partnership,
    } = req.body;

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (content.image && content.image.filename) {
        deleteFile(content.image.filename);
      }

      content.image = {
        url: `/uploads/${req.file.filename}`,
        alt: req.body.imageAlt || title,
        filename: req.file.filename,
      };
    }

    // Check for duplicate order within the same type (only if order is being changed)
    if (order !== undefined && order !== content.order) {
      const existingWithOrder = await Content.findOne({
        type: content.type,
        order: order,
        isActive: true,
        _id: { $ne: content._id }, // Exclude current item
      });

      if (existingWithOrder) {
        return res.status(400).json({
          success: false,
          message: `Order ${order} is already taken for ${content.type} items. Please choose a different order number.`,
          error: "DUPLICATE_ORDER",
        });
      }
    }

    // Update fields
    if (type !== undefined) content.type = type;
    if (title !== undefined) content.title = title;
    if (description !== undefined) content.description = description;
    if (link !== undefined) content.link = link;
    if (stakeCode !== undefined) content.stakeCode = stakeCode;
    if (order !== undefined) content.order = order;
    if (isActive !== undefined) content.isActive = isActive;
    if (metadata !== undefined)
      content.metadata = new Map(Object.entries(metadata));
    if (teamMember !== undefined) content.teamMember = teamMember;
    if (partnership !== undefined) content.partnership = partnership;

    await content.save();

    res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: content,
    });
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update content",
      error: error.message,
    });
  }
};

// Delete content
export const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Delete associated image file
    if (content.image && content.image.filename) {
      deleteFile(content.image.filename);
    }

    await Content.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete content",
      error: error.message,
    });
  }
};

// Reorder content
export const reorderContent = async (req, res) => {
  try {
    const { type, items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Items must be an array",
      });
    }

    // Update order for each item
    const updatePromises = items.map((item, index) => {
      return Content.findByIdAndUpdate(
        item.id,
        { order: index },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Content reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder content",
      error: error.message,
    });
  }
};

// Bulk operations (activate/deactivate/delete)
export const bulkOperation = async (req, res) => {
  try {
    const { ids, operation } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "IDs must be a non-empty array",
      });
    }

    let result;
    switch (operation) {
      case "activate":
        result = await Content.updateMany(
          { _id: { $in: ids } },
          { isActive: true }
        );
        break;
      case "deactivate":
        result = await Content.updateMany(
          { _id: { $in: ids } },
          { isActive: false }
        );
        break;
      case "delete":
        // Get content to delete associated files
        const contentToDelete = await Content.find({ _id: { $in: ids } });
        for (const item of contentToDelete) {
          if (item.image && item.image.filename) {
            deleteFile(item.image.filename);
          }
        }
        result = await Content.deleteMany({ _id: { $in: ids } });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid operation. Use activate, deactivate, or delete",
        });
    }

    res.status(200).json({
      success: true,
      message: `Bulk operation '${operation}' completed successfully`,
      affectedCount: result.modifiedCount || result.deletedCount,
    });
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform bulk operation",
      error: error.message,
    });
  }
};

// Get content statistics
export const getContentStats = async (req, res) => {
  try {
    const stats = await Content.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ["$isActive", 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching content stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch content statistics",
      error: error.message,
    });
  }
};

// Validation middleware for content creation
export const validateContentCreation = [
  body("type")
    .isIn(["menu", "mainnet", "testnet", "partnership", "about", "team"])
    .withMessage("Invalid content type"),
  body("title")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description must be less than 2000 characters"),
  body("link")
    .optional()
    .custom((value) => {
      // Allow relative URLs (starting with /) or valid URLs
      if (
        value.startsWith("/") ||
        value.startsWith("#") ||
        /^https?:\/\/.+/.test(value)
      ) {
        return true;
      }
      throw new Error("Link must be a valid URL or relative path");
    }),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

// Validation middleware for content update
export const validateContentUpdate = [
  body("type")
    .optional()
    .isIn(["menu", "mainnet", "testnet", "partnership", "about", "team"])
    .withMessage("Invalid content type"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description must be less than 2000 characters"),
  body("link")
    .optional()
    .custom((value) => {
      // Allow relative URLs (starting with /) or valid URLs
      if (
        value.startsWith("/") ||
        value.startsWith("#") ||
        /^https?:\/\/.+/.test(value)
      ) {
        return true;
      }
      throw new Error("Link must be a valid URL or relative path");
    }),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];
