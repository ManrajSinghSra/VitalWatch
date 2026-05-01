// controllers/auth.controller.js
import { User } from "../models/User.js";
import { SuperAdmin } from "../models/SuperAdmin.js";
import { AuditLog } from "../models/AuditLog.js";
import { incrementTotalUsers } from "../utils/updateStats.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/register — public user signup only
// ─────────────────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, location, password, confirmPassword } = req.body;

    // validate all fields present
    if (!name || !email || !location || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // confirm password check — never stored
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // create user — password hashed by pre-save hook
    const user = await User.create({
      name,
      email,
      location,
      password,
      role: "user", // always user on signup
    });

    // update superadmin stats
    await incrementTotalUsers();

    // audit log
    await AuditLog.create({
      level:         "INFO",
      action:        `New user registered: ${user.name}`,
      performedBy:   user.name,
      performedById: user._id,
    });

    return res.status(201).json({
      message: "Account created successfully",
      user: {
        _id:      user._id,
        name:     user.name,
        email:    user.email,
        location: user.location,
        role:     user.role,
      },
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/login — works for all 3 roles from same endpoint
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // step 1 — check users collection (user + admin)
    let account = await User.findOne({ email }).select("+password");

    // step 2 — if not found, check superadmins collection
    if (!account) {
      account = await SuperAdmin.findOne({ email }).select("+password");
    }

    // step 3 — not found in either
    if (!account) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // step 4 — check if active
    if (!account.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated" });
    }

    // step 5 — compare password using schema method
    const isMatch = await account.isPasswordCorrect(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // step 6 — generate token using schema method
    const token = account.getToken();

    // step 7 — update lastLogin
    account.lastLogin = new Date();
    await account.save({ validateBeforeSave: false });

    // step 8 — audit log
    await AuditLog.create({
      level:         "INFO",
      action:        `${account.name} logged in as ${account.role}`,
      performedBy:   account.name,
      performedById: account._id,
    });

    // step 9 — set cookie and respond
    return res
      .cookie("accessToken", token, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .status(200)
      .json({
        message: "Login successful",
        token,
        role:  account.role,
        user: {
          _id:         account._id,
          name:        account.name,
          email:       account.email,
          role:        account.role,
          location:    account.location || null,
          permissions: account.permissions || null,
        },
      });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/logout
// ─────────────────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    return res
      .clearCookie("accessToken")
      .status(200)
      .json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Logout failed" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /auth/me — get current logged in user
// ─────────────────────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get user" });
  }
};