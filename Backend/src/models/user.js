import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minLength: [3, "Name cannot be less than 3 characters"],
    maxLength: [50, "Name cannot exceed 50 characters"],
  },
  emailId: {
    type: String,
    unique: true,
    trim: true,
    required: true,
    minLength: [4, "EmailId cannot be that small"],
    maxLength: [254, "Email cannot exceed 254 characters"],
  },
  phone: {
    type: String,
    trim: true,
    required: false, // Optional field
    match: [/^\d{10}$/, "Phone number must be 10 digits"], // Example validation for phone numbers
  },
  password: {
    type: String,
    required: true,
    minLength: [6, "Password cannot be that short"],
  },
  role: {
    type: String,
    enum: ["user", "gymOwner"],  
    default: "user",  
  },
  subscription: {
    type: String,
    enum: ["Traveler", "Gym Owner"],  
    default: "Traveler", 
  },
  stats: {
    workoutsThisMonth: {
      type: Number,
      default: 0,
    },
    gymVisits: { 
      type: Number,
      default: 0,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    tokensRemaining: {
      type: String,
      default: "Unlimited", 
    },
  },
  recentGyms: [
    {
      name: { type: String, required: true },
      location: { type: String, required: true },
      date: { type: Date, required: true },
      rating: { type: Number, required: true },
    },
  ],
  upcomingBookings: [
    {
      gym: { type: String, required: true },
      time: { type: String, required: true },
      date: { type: Date, required: true }
     
    },
  ],
});
 
userSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};
 
userSchema.methods.getToken = function () {
  return jwt.sign({ _id: this._id, role: this.role }, process.env.SECRET, {
    expiresIn: "1d",
  });
};

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model("user", userSchema);

