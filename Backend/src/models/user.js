// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

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

    
  },

  { timestamps: true }  
);
 
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
 
userSchema.methods.isPasswordCorrect = async function (plain) {
  return await bcrypt.compare(plain, this.password);
};

export const User = mongoose.model("User", userSchema);
