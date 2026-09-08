import About from "../models/About.js";
import { asObjectId, updateBySafeId, deleteBySafeId } from "../utils/objectId.js";

export const createAboutContent = async (req, res) => {
  try {
    const { title, content } = req.body;

    const aboutData = {
      title,
      content,
    };

    const aboutContent = new About(aboutData);
    await aboutContent.save();

    res.status(201).json({
      success: true,
      msg: "About Content Created Successfully!",
      data: aboutContent,
    });
  } catch (error) {
    console.error("Create about content error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to create about content",
      error: error.message,
    });
  }
};

export const getAboutContent = async (req, res) => {
  try {
    const aboutContent = await About.find({});
    res.status(200).json({
      success: true,
      msg: "About Content Fetched Successfully!",
      data: aboutContent,
    });
  } catch (error) {
    console.error("Get about content error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch about content",
      error: error.message,
    });
  }
};

export const updateAboutContent = async (req, res) => {
  try {
    const { title, content } = req.body;

    const updateData = {
      title,
      content,
    };

    if (!asObjectId(req.params.id)) {
      return res.status(400).json({ success: false, msg: "Invalid id" });
    }
    const updatedAboutContent = await updateBySafeId(
      About,
      req.params.id,
      updateData
    );

    if (!updatedAboutContent) {
      return res.status(404).json({
        success: false,
        msg: "About Content not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "About Content Updated Successfully!",
      data: updatedAboutContent,
    });
  } catch (error) {
    console.error("Update about content error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update about content",
      error: error.message,
    });
  }
};

export const deleteAboutContent = async (req, res) => {
  try {
    if (!asObjectId(req.params.id)) {
      return res.status(400).json({ success: false, msg: "Invalid id" });
    }
    const deletedAboutContent = await deleteBySafeId(About, req.params.id);

    if (!deletedAboutContent) {
      return res.status(404).json({
        success: false,
        msg: "About Content not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "About Content Deleted Successfully!",
    });
  } catch (error) {
    console.error("Delete about content error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to delete about content",
      error: error.message,
    });
  }
};
