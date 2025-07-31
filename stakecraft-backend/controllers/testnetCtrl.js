import Testnet from "../models/Testnet.js";

export const createTestnetList = async (req, res) => {
  const { title, description, image } = req.body;
  const testnetData = {
    title,
    description,
    image,
  };

  const testnet = new Testnet(testnetData);
  await testnet.save();

  res.status(201).json({
    success: true,
    msg: "Testnet Created Successfully!",
    data: testnet,
  });
};

export const getTestnetList = async (req, res) => {
  const testnet = await Testnet.find({});
  res.status(200).json({
    success: true,
    msg: "Testnet Fetched Successfully!",
    data: testnet,
  });
};

export const updateTestnetList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;

    const updateData = {
      title,
      description,
      image,
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
