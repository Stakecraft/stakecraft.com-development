import Mainnet from "../models/Mainnet.js";

export const createMainnetList = async (req, res) => {
  const { title, description, image, validator, howToStake, explorer } =
    req.body;

  const mainnetData = {
    title,
    description,
    image,
    validator,
    howToStake,
    explorer,
  };

  const mainnet = new Mainnet(mainnetData);
  await mainnet.save();

  res.status(201).json({
    success: true,
    msg: "Mainnet Created Successfully!",
    data: mainnet,
  });
};

export const getMainnetList = async (req, res) => {
  const mainnet = await Mainnet.find({});
  res.status(200).json({
    success: true,
    msg: "Mainnet Fetched Successfully!",
    data: mainnet,
  });
};

export const updateMainnetList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, validator, howToStake, explorer } =
      req.body;

    const updateData = {
      title,
      description,
      image,
      validator,
      howToStake,
      explorer,
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
