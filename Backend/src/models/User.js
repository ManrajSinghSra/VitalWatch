// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema(
  { 
    name: {
      type: String,
      required: [true, "Name is required"],      
      trim: true,
    },
 
    email: {
      type: String,
      required: [true, "Valid email required"],   
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
      minlength: [6, "Min 6 characters"],        
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
     lastLogin: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true }  
);
 
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.generateToken = function () {
  const user = this;
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {  expiresIn: "7d" }
  );
  return token;
};
 
userSchema.methods.isPasswordCorrect = async function (plain) {
  return await bcrypt.compare(plain, this.password);
};
 
userSchema.methods.hasPermission = function (permission) {
  if (this.role !== "admin") return false;
  return this.permissions?.[permission] === true;
};

export const User = mongoose.model("User", userSchema);