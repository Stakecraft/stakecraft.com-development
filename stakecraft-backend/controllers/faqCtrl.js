import Faq from "../models/Faq.js";

export const createFaq = async (req, res) => {
  try {
    const { question, answer, order, isActive } = req.body;

    const faq = new Faq({
      question,
      answer,
      order: order ?? 0,
      isActive: isActive !== false,
    });
    await faq.save();

    res.status(201).json({
      success: true,
      msg: "FAQ Created Successfully!",
      data: faq,
    });
  } catch (error) {
    console.error("Create FAQ error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to create FAQ",
      error: error.message,
    });
  }
};

export const getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find({}).sort({ order: 1, createdAt: 1 });
    res.status(200).json({
      success: true,
      msg: "FAQs Fetched Successfully!",
      data: faqs,
    });
  } catch (error) {
    console.error("Get FAQs error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch FAQs",
      error: error.message,
    });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, order, isActive } = req.body;

    const updateData = {
      question,
      answer,
      order: order ?? 0,
      isActive: isActive !== false,
    };

    const updatedFaq = await Faq.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedFaq) {
      return res.status(404).json({
        success: false,
        msg: "FAQ not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "FAQ Updated Successfully!",
      data: updatedFaq,
    });
  } catch (error) {
    console.error("Update FAQ error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update FAQ",
      error: error.message,
    });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFaq = await Faq.findByIdAndDelete(id);

    if (!deletedFaq) {
      return res.status(404).json({
        success: false,
        msg: "FAQ not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "FAQ Deleted Successfully!",
    });
  } catch (error) {
    console.error("Delete FAQ error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to delete FAQ",
      error: error.message,
    });
  }
};
