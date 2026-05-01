// models/SuperAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "perfu3worf";

const superAdminSchema = new mongoose.Schema(
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

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      default: "superadmin",
      immutable: true, // can never be changed
    },

    platformStats: {
      totalUsers:       { type: Number, default: 0 },
      totalAdmins:      { type: Number, default: 0 },
      reportsProcessed: { type: Number, default: 0 },
      aiQueriesToday:   { type: Number, default: 0 },
      apiCallsTotal:    { type: Number, default: 0 },
      uptime:           { type: String, default: "100%" },
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// hash password before saving
superAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare password on login
superAdminSchema.methods.isPasswordCorrect = async function (plain) {
  return await bcrypt.compare(plain, this.password);
};

// generate JWT token
superAdminSchema.methods.getToken = function () {
  return jwt.sign(
    { _id: this._id },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);
