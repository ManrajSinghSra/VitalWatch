import { AuditLog } from "../models/AuditsLog.js";
import { Report } from "../models/Report.js";
import { SuperAdmin } from "../models/SuperAdmin.js";
import { User } from "../models/User.js";

export const getStats = async (req, res) => {
  try {
    const sa = await SuperAdmin.findOne({ role: "superadmin" });
 
    const totalUsers  = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalReports=await Report.countDocuments()

    const uptimeSeconds = process.uptime();
    const totalHours    = uptimeSeconds / 3600;
    const uptimePercent = Math.min(100, (uptimeSeconds / (30 * 24 * 3600)) * 100);

    console.log(uptimeSeconds);
    
    sa.platformStats.uptime = `${uptimePercent.toFixed(2)}%`;

    sa.platformStats.totalUsers  = totalUsers;
    sa.platformStats.totalAdmins = totalAdmins;
    sa.platformStats.reportsProcessed=totalReports;
    await sa.save({ validateBeforeSave: false });

    return res.status(200).json({ stats: sa.platformStats });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
};

export const getAllUsers=async(req,res)=>{
    try {
    const users = await User.find()
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
}

export const promoteToAdmin=async(req,res)=>{

   try {
    const { userId } = req.params;
    const { permissions } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ message: "User is already an admin" });

    user.role       = "admin";
    user.promotedBy = req.user._id;
    user.promotedAt = new Date();
    user.permissions = {
      canUploadReports:     permissions?.canUploadReports     ?? true,
      canManageAlerts:      permissions?.canManageAlerts      ?? true,
      canViewUsers:         permissions?.canViewUsers         ?? true,
      canSendNotifications: permissions?.canSendNotifications ?? true,
      canDeleteReports:     permissions?.canDeleteReports     ?? false,
    };

    await user.save({ validateBeforeSave: false });
    await incrementTotalAdmins();

    await AuditLog.create({
      level:         "WARN",
      action:        `Promoted ${user.name} to Admin`,
      performedBy:   req.user.name,
      performedById: req.user._id,
    });

    return res.status(200).json({
      message: `${user.name} promoted to Admin successfully`,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, promotedAt: user.promotedAt, permissions: user.permissions },
    });

  } catch (err) {
    return res.status(500).json({ message: "Promotion failed", error: err.message });
  }

}

export const demoteToUser=async(req,res)=>{
    try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "admin") return res.status(400).json({ message: "User is not an admin" });

    user.role        = "user";
    user.promotedBy  = null;
    user.promotedAt  = null;
    user.permissions = {
      canUploadReports: false, canManageAlerts: false,
      canViewUsers: false, canSendNotifications: false, canDeleteReports: false,
    };

    await user.save({ validateBeforeSave: false });
    await decrementTotalAdmins();

    await AuditLog.create({
      level:         "WARN",
      action:        `Demoted ${user.name} from Admin to User`,
      performedBy:   req.user.name,
      performedById: req.user._id,
    });

    return res.status(200).json({ message: `${user.name} demoted to User successfully` });

  } catch (err) {
    return res.status(500).json({ message: "Demotion failed", error: err.message });
  }
}
 

export const banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    await AuditLog.create({
      level:         "DANGER",
      action:        `Banned user: ${user.name}`,
      performedBy:   req.user.name,
      performedById: req.user._id,
    });

    return res.status(200).json({ message: `${user.name} has been banned` });
  } catch (err) {
    return res.status(500).json({ message: "Ban failed" });
  }
};
 
export const unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { isActive: true }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    await AuditLog.create({
      level:         "INFO",
      action:        `Unbanned user: ${user.name}`,
      performedBy:   req.user.name,
      performedById: req.user._id,
    });

    return res.status(200).json({ message: `${user.name} has been unbanned` });
  } catch (err) {
    return res.status(500).json({ message: "Unban failed" });
  }
};
 
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await AuditLog.create({
      level:         "DANGER",
      action:        `Permanently deleted user: ${user.name}`,
      performedBy:   req.user.name,
      performedById: req.user._id,
    });

    return res.status(200).json({ message: `${user.name} permanently deleted` });
  } catch (err) {
    return res.status(500).json({ message: "Delete failed" });
  }
};
 
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ logs });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};
