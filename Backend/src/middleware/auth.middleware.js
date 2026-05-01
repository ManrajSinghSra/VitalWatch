// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { SuperAdmin } from "../models/SuperAdmin.js";
import { incrementApiCalls } from "../utils/updateStats.js";

const JWT_SECRET = process.env.JWT_SECRET || "perfu3worf";

// ── Verify JWT token ──────────────────────────────────────────────────────────
export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Unauthorized — no token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // check users collection first
    let user = await User.findById(decoded._id).select("-password");

    // if not found check superadmins collection
    if (!user) {
      user = await SuperAdmin.findById(decoded._id).select("-password");
    }

    if (!user) {
      return res.status(401).json({ message: "Unauthorized — user not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated" });
    }

    // attach user to every request
    req.user = user;

    // track api calls
    incrementApiCalls();

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ── SuperAdmin only ───────────────────────────────────────────────────────────
export const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Access denied — SuperAdmin only" });
  }
  next();
};

export const Auth = verifyToken;

// ── Admin + SuperAdmin ────────────────────────────────────────────────────────
export const isAdmin = (req, res, next) => {
  if (!["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied — Admin only" });
  }
  next();
};
