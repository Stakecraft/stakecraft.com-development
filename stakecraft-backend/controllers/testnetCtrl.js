import Testnet from "../models/Testnet.js";

export const createTestnetList = async (req, res) => {
  try {
    const { title, description, image, order } = req.body;

    // Check for duplicate order
    if (order !== undefined && order !== null) {
      const existingWithOrder = await Testnet.findOne({ order: order });

      if (existingWithOrder) {
        return res.status(400).json({
          success: false,
          msg: `Order ${order} is already taken. Please choose a different order number.`,
          error: "DUPLICATE_ORDER",
        });
      }
    }

    const testnetData = {
      title,
      description,
      image,
      order: order || 0,
    };

    const testnet = new Testnet(testnetData);
    await testnet.save();

    res.status(201).json({
      success: true,
      msg: "Testnet Created Successfully!",
      data: testnet,
    });
  } catch (error) {
    console.error("Create testnet error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to create testnet",
      error: error.message,
    });
  }
};

export const getTestnetList = async (req, res) => {
  const testnet = await Testnet.find({}).sort({ order: 1 });
  res.status(200).json({
    success: true,
    msg: "Testnet Fetched Successfully!",
    data: testnet,
  });
};

export const updateTestnetList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, order } = req.body;

    // Check for duplicate order (only if order is being changed)
    if (order !== undefined && order !== null) {
      const currentTestnet = await Testnet.findById(id);

      if (!currentTestnet) {
        return res.status(404).json({
          success: false,
          msg: "Testnet not found",
        });
      }

      if (order !== currentTestnet.order) {
        const existingWithOrder = await Testnet.findOne({
          order: order,
          _id: { $ne: id }, // Exclude current item
        });

        if (existingWithOrder) {
          return res.status(400).json({
            success: false,
            msg: `Order ${order} is already taken. Please choose a different order number.`,
            error: "DUPLICATE_ORDER",
          });
        }
      }
    }

    const updateData = {
      title,
      description,
      image,
      order,
    };

    const updatedTestnet = await Testnet.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTestnet) {
      return res.status(404).json({
        success: false,
        msg: "Testnet not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Testnet Updated Successfully!",
      data: updatedTestnet,
    });
  } catch (error) {
    console.error("Update testnet error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update testnet",
      error: error.message,
    });
  }
};

export const deleteTestnetList = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTestnet = await Testnet.findByIdAndDelete(id);

    if (!deletedTestnet) {
      return res.status(404).json({
        success: false,
        msg: "Testnet not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Testnet Deleted Successfully!",
    });
  } catch (error) {
    console.error("Delete testnet error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to delete testnet",
      error: error.message,
    });
  }
};

export const updateTestnetPositions = async (req, res) => {
  try {
    const { positions } = req.body; // Array of { id, order } objects

    if (!Array.isArray(positions)) {
      return res.status(400).json({
        success: false,
        msg: "Positions must be an array",
      });
    }

    // Update each card's position
    const updatePromises = positions.map(({ id, order }) =>
      Testnet.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    // Fetch updated list
    const updatedTestnet = await Testnet.find({}).sort({ order: 1 });

    res.status(200).json({
      success: true,
      msg: "Testnet positions updated successfully!",
      data: updatedTestnet,
    });
  } catch (error) {
    console.error("Update testnet positions error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update testnet positions",
      error: error.message,
    });
  }
};
