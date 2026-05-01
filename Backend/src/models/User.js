// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "perfu3worf";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    promotedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },

    promotedAt: {
      type: Date,
      default: null,
    },

    permissions: {
      canUploadReports:     { type: Boolean, default: false },
      canManageAlerts:      { type: Boolean, default: false },
      canViewUsers:         { type: Boolean, default: false },
      canSendNotifications: { type: Boolean, default: false },
      canDeleteReports:     { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare password on login
userSchema.methods.isPasswordCorrect = async function (plain) {
  return await bcrypt.compare(plain, this.password);
};

// generate JWT token
userSchema.methods.getToken = function () {
  return jwt.sign(
    { _id: this._id },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// check admin permission
userSchema.methods.hasPermission = function (permission) {
  if (this.role === "superadmin") return true;
  if (this.role !== "admin") return false;
  return this.permissions?.[permission] === true;
};

export const User = mongoose.model("User", userSchema);
