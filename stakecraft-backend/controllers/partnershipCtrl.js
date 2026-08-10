import Partnership from "../models/Partnership.js";

export const createPartnershipList = async (req, res) => {
  const { title, image, isVisible } = req.body;
  const partnershipData = {
    title,
    image,
    isVisible: isVisible !== false,
  };
  const partnership = new Partnership(partnershipData);
  await partnership.save();
  res.status(201).json({
    success: true,
    msg: "Partnership Created Successfully!",
    data: partnership,
  });
};

export const getPartnershipList = async (req, res) => {
  const includeHidden =
    req.query.includeHidden === "true" || req.query.includeHidden === "1";
  const filter = includeHidden ? {} : { isVisible: { $ne: false } };
  const partnership = await Partnership.find(filter);
  res.status(200).json({
    success: true,
    msg: "Partnership Fetched Successfully!",
    data: partnership,
  });
};

export const updatePartnershipList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image, isVisible } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (image !== undefined) updateData.image = image;
    if (isVisible !== undefined) updateData.isVisible = isVisible;

    const updatedPartnership = await Partnership.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPartnership) {
      return res.status(404).json({
        success: false,
        msg: "Partnership not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Partnership Updated Successfully!",
      data: updatedPartnership,
    });
  } catch (error) {
    console.error("Update partnership error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update partnership",
      error: error.message,
    });
  }
};

export const deletePartnershipList = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPartnership = await Partnership.findByIdAndDelete(id);

    if (!deletedPartnership) {
      return res.status(404).json({
        success: false,
        msg: "Partnership not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Partnership Deleted Successfully!",
    });
  } catch (error) {
    console.error("Delete partnership error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to delete partnership",
      error: error.message,
    });
  }
};
