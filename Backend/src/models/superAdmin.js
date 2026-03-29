import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      immutable: true,
    },
    platformStats: {
      totalUsers:       { type: Number, default: 0      }, 
      totalAdmins:      { type: Number, default: 0      }, 
      reportsProcessed: { type: Number, default: 0      },  
      aiQueriesToday:   { type: Number, default: 0      },  
      apiCallsTotal:    { type: Number, default: 0      },  
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
 
superAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
 
superAdminSchema.methods.isPasswordCorrect = async function (plain) {
  return await bcrypt.compare(plain, this.password);
};

superAdminSchema.methods.getToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, "perfu3worf", {
    expiresIn: "1d",
  });
  return token;
};
 
export const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);
