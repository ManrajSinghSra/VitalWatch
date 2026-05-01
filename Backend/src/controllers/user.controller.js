// controllers/user.controller.js
import { User } from "../models/User.js";

// GET /user/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// PATCH /user/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, location } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, location },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({ message: "Profile updated successfully", user });

  } catch (err) {
    return res.status(500).json({ message: "Update failed" });
  }
};