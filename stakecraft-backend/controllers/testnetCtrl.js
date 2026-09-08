import Testnet from "../models/Testnet.js";
import {
  asObjectId,
  eqNumber,
  findBySafeId,
  findOneByOrder,
  updateBySafeId,
  deleteBySafeId,
} from "../utils/objectId.js";

export const createTestnetList = async (req, res) => {
  try {
    const { title, description, image, order, isVisible } = req.body;

    // Check for duplicate order
    if (order !== undefined && order !== null) {
      const existingWithOrder = await findOneByOrder(Testnet, order);

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
      isVisible: isVisible !== false,
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
  const includeHidden =
    req.query.includeHidden === "true" || req.query.includeHidden === "1";
  const filter = includeHidden ? {} : { isVisible: { $ne: false } };
  const testnet = await Testnet.find(filter).sort({ order: 1 });
  res.status(200).json({
    success: true,
    msg: "Testnet Fetched Successfully!",
    data: testnet,
  });
};

export const updateTestnetList = async (req, res) => {
  try {
    const id = asObjectId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, msg: "Invalid id" });
    }
    const { title, description, image, order, isVisible } = req.body;

    // Check for duplicate order (only if order is being changed)
    if (order !== undefined && order !== null) {
      const currentTestnet = await findBySafeId(Testnet, id);

      if (!currentTestnet) {
        return res.status(404).json({
          success: false,
          msg: "Testnet not found",
        });
      }

      if (order !== currentTestnet.order) {
        const existingWithOrder = await findOneByOrder(Testnet, order, id);

        if (existingWithOrder) {
          return res.status(400).json({
            success: false,
            msg: `Order ${order} is already taken. Please choose a different order number.`,
            error: "DUPLICATE_ORDER",
          });
        }
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (order !== undefined) updateData.order = order;
    if (isVisible !== undefined) updateData.isVisible = isVisible;

    const updatedTestnet = await updateBySafeId(Testnet, id, updateData);

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
    const id = asObjectId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, msg: "Invalid id" });
    }
    const deletedTestnet = await deleteBySafeId(Testnet, id);

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
    const updatePromises = positions.flatMap(({ id, order }) => {
      const oid = asObjectId(id);
      const orderFilter = eqNumber(order);
      if (!oid || !orderFilter) return [];
      return [
        updateBySafeId(Testnet, oid, { order: orderFilter.$eq }),
      ];
    });

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

    for (const rawId of ids) {
      try {
        const id = asObjectId(rawId);
        if (!id) {
          errors.push({ id: rawId, error: "Invalid id" });
          continue;
        }
        // Find the testnet network
        const testnetNetwork = await findBySafeId(Testnet, id);

        if (!testnetNetwork) {
          errors.push({ id: rawId, error: "Network not found" });
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
          isVisible:
            testnetNetwork.isVisible !== undefined
              ? testnetNetwork.isVisible
              : true,
        };

        const newMainnet = new Mainnet(mainnetData);
        await newMainnet.save();

        // Delete from testnet
        await deleteBySafeId(Testnet, id);

        migratedNetworks.push({
          originalId: rawId,
          newId: newMainnet._id,
          title: testnetNetwork.title,
        });
      } catch (error) {
        errors.push({ id: rawId, error: error.message });
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
