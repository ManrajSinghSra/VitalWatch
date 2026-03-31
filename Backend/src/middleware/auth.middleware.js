import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { SuperAdmin } from "../models/SuperAdmin.js";

const JWT_SECRET = process.env.JWT_SECRET || "perfu3worf";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Please login" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    let user = await User.findById(userId).select("-password");
    if (!user) {
      user = await SuperAdmin.findById(userId).select("-password");
    }
    if (!user || user.isActive === false) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

export const isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Super admin access required" });
  }

  next();
};

export const Auth = verifyToken;
