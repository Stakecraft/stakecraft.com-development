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

// Migrate testnet network(s) to mainnet
export const migrateToMainnet = async (req, res) => {
  try {
    const { ids } = req.body; // Array of testnet IDs to migrate

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Please provide an array of network IDs to migrate",
      });
    }

    // Import Mainnet model
    const Mainnet = (await import("../models/Mainnet.js")).default;

    const migratedNetworks = [];
    const errors = [];

    for (const id of ids) {
      try {
        // Find the testnet network
        const testnetNetwork = await Testnet.findById(id);

        if (!testnetNetwork) {
          errors.push({ id, error: "Network not found" });
          continue;
        }

        // Get the highest order in mainnet and add 1
        const highestMainnet = await Mainnet.findOne({}).sort({ order: -1 });
        const newOrder = highestMainnet ? highestMainnet.order + 1 : 1;

        // Create new mainnet entry with the testnet data
        const mainnetData = {
          title: testnetNetwork.title,
          description: testnetNetwork.description,
          image: testnetNetwork.image,
          validator: "", // Optional fields for mainnet
          howToStake: "",
          explorer: "",
          order: newOrder,
        };

        const newMainnet = new Mainnet(mainnetData);
        await newMainnet.save();

        // Delete from testnet
        await Testnet.findByIdAndDelete(id);

        migratedNetworks.push({
          originalId: id,
          newId: newMainnet._id,
          title: testnetNetwork.title,
        });
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      msg: `Successfully migrated ${migratedNetworks.length} network(s) to mainnet`,
      data: {
        migrated: migratedNetworks,
        errors: errors,
      },
    });
  } catch (error) {
    console.error("Migrate to mainnet error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to migrate networks to mainnet",
      error: error.message,
    });
  }
};
