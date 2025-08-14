import Team from "../models/Team.js";

export const createTeamMember = async (req, res) => {
  try {
    const { name, position, image } = req.body;

    const teamData = {
      name,
      position,
      image,
    };

    const teamMember = new Team(teamData);
    await teamMember.save();

    res.status(201).json({
      success: true,
      msg: "Team Member Created Successfully!",
      data: teamMember,
    });
  } catch (error) {
    console.error("Create team member error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to create team member",
      error: error.message,
    });
  }
};

export const getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await Team.find({});
    res.status(200).json({
      success: true,
      msg: "Team Members Fetched Successfully!",
      data: teamMembers,
    });
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch team members",
      error: error.message,
    });
  }
};

export const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, image } = req.body;

    const updateData = {
      name,
      position,
      image,
    };

    const updatedTeamMember = await Team.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTeamMember) {
      return res.status(404).json({
        success: false,
        msg: "Team Member not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Team Member Updated Successfully!",
      data: updatedTeamMember,
    });
  } catch (error) {
    console.error("Update team member error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update team member",
      error: error.message,
    });
  }
};

export const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTeamMember = await Team.findByIdAndDelete(id);

    if (!deletedTeamMember) {
      return res.status(404).json({
        success: false,
        msg: "Team Member not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Team Member Deleted Successfully!",
    });
  } catch (error) {
    console.error("Delete team member error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to delete team member",
      error: error.message,
    });
  }
};
