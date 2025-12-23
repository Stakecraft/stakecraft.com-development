import Mainnet from "../models/Mainnet.js";

export const createMainnetList = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      validator,
      howToStake,
      explorer,
      order,
    } = req.body;

    // Check for duplicate order
    if (order !== undefined && order !== null) {
      const existingWithOrder = await Mainnet.findOne({ order: order });

      if (existingWithOrder) {
        return res.status(400).json({
          success: false,
          msg: `Order ${order} is already taken. Please choose a different order number.`,
          error: "DUPLICATE_ORDER",
        });
      }
    }

    const mainnetData = {
      title,
      description,
      image,
      validator,
      howToStake,
      explorer,
      order: order || 0,
    };

    const mainnet = new Mainnet(mainnetData);
    await mainnet.save();

    res.status(201).json({
      success: true,
      msg: "Mainnet Created Successfully!",
      data: mainnet,
    });
  } catch (error) {
    console.error("Create mainnet error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to create mainnet",
      error: error.message,
    });
  }
};

export const getMainnetList = async (req, res) => {
  const mainnet = await Mainnet.find({}).sort({ order: 1 });
  res.status(200).json({
    success: true,
    msg: "Mainnet Fetched Successfully!",
    data: mainnet,
  });
};

export const updateMainnetList = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      image,
      validator,
      howToStake,
      explorer,
      order,
    } = req.body;

    // Check for duplicate order (only if order is being changed)
    if (order !== undefined && order !== null) {
      const currentMainnet = await Mainnet.findById(id);

      if (!currentMainnet) {
        return res.status(404).json({
          success: false,
          msg: "Mainnet not found",
        });
      }

      if (order !== currentMainnet.order) {
        const existingWithOrder = await Mainnet.findOne({
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
      validator,
      howToStake,
      explorer,
      order,
    };

    const updatedMainnet = await Mainnet.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedMainnet) {
      return res.status(404).json({
        success: false,
        msg: "Mainnet not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Mainnet Updated Successfully!",
      data: updatedMainnet,
    });
  } catch (error) {
    console.error("Update mainnet error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update mainnet",
      error: error.message,
    });
  }
};

export const deleteMainnetList = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMainnet = await Mainnet.findByIdAndDelete(id);

    if (!deletedMainnet) {
      return res.status(404).json({
        success: false,
        msg: "Mainnet not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Mainnet Deleted Successfully!",
    });
  } catch (error) {
    console.error("Delete mainnet error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to delete mainnet",
      error: error.message,
    });
  }
};

export const updateMainnetPositions = async (req, res) => {
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
      Mainnet.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    // Fetch updated list
    const updatedMainnet = await Mainnet.find({}).sort({ order: 1 });

    res.status(200).json({
      success: true,
      msg: "Mainnet positions updated successfully!",
      data: updatedMainnet,
    });
  } catch (error) {
    console.error("Update mainnet positions error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update mainnet positions",
      error: error.message,
    });
  }
};

// Migrate mainnet network(s) to testnet
export const migrateToTestnet = async (req, res) => {
  try {
    const { ids } = req.body; // Array of mainnet IDs to migrate

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Please provide an array of network IDs to migrate",
      });
    }

    // Import Testnet model
    const Testnet = (await import("../models/Testnet.js")).default;

    const migratedNetworks = [];
    const errors = [];

    for (const id of ids) {
      try {
        // Find the mainnet network
        const mainnetNetwork = await Mainnet.findById(id);

        if (!mainnetNetwork) {
          errors.push({ id, error: "Network not found" });
          continue;
        }

        // Get the highest order in testnet and add 1
        const highestTestnet = await Testnet.findOne({}).sort({ order: -1 });
        const newOrder = highestTestnet ? highestTestnet.order + 1 : 1;

        // Create new testnet entry with the mainnet data
        const testnetData = {
          title: mainnetNetwork.title,
          description: mainnetNetwork.description,
          image: mainnetNetwork.image,
          order: newOrder,
        };

        const newTestnet = new Testnet(testnetData);
        await newTestnet.save();

        // Delete from mainnet
        await Mainnet.findByIdAndDelete(id);

        migratedNetworks.push({
          originalId: id,
          newId: newTestnet._id,
          title: mainnetNetwork.title,
        });
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      msg: `Successfully migrated ${migratedNetworks.length} network(s) to testnet`,
      data: {
        migrated: migratedNetworks,
        errors: errors,
      },
    });
  } catch (error) {
    console.error("Migrate to testnet error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to migrate networks to testnet",
      error: error.message,
    });
  }
};
