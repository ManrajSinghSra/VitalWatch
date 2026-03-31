import { AuditLog } from "../models/AuditsLog.js";
import { SuperAdmin } from "../models/SuperAdmin.js";
import { User } from "../models/User.js";
import { incrementTotalUsers } from "../utils/stats.js";
 
export const register = async (req, res) => {
  try {
    const { name, email, location, password, confirmPassword } = req.body;

    if (!name || !email || !location || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, location, password, role: "user" });

    await incrementTotalUsers();
    await AuditLog.create({
      level: "INFO",
      action: `New user registered: ${user.name}`,
      performedBy: user.name,
      performedById: user._id,
    });

    return res.status(201).json({
      message: "Account created successfully",
      data:user
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

export const login=async(req,res)=>{

try {
   const {email,password}=req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    let account = await User.findOne({ email }).select("+password");

    if (!account) {
      account = await SuperAdmin.findOne({ email }).select("+password");
    }

    if (!account) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!account.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated" });
    }

    const isMatch = await account.isPasswordCorrect(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = account.generateToken();

    account.lastLogin = new Date();
    await account.save({validateBeforeSave:false});

     await AuditLog.create({
      level: "INFO",
      action: `${account.name} logged in as ${account.role}`,
      performedBy: account.name,
      performedById: account._id,
    });

    res.cookie("token",token,{maxAge:7 * 24 * 60 * 60 * 1000})

    res.status(200)
      .json({
        message: "Login successful",
        data: {
          _id:         account._id,
          name:        account.name,
          email:       account.email,
          role:        account.role,
          location:    account.location || null,
          permissions: account.permissions || null,
        },
      });
  } catch (err) {
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
}

export const logout=async(req,res)=>{
     try {
    return res.clearCookie("token").status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Logout failed" });
  }
} 

export const getMe=async(req,res)=>{
try {
    return res.status(200).json({ user: req.user });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
}