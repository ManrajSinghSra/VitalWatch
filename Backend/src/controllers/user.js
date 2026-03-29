import { SuperAdmin } from "../models/superAdmin.js";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";

export const superAdminLogin=async(req,res)=>{
       try {
          const {email,password}=req.body;
 
          if( !email || !password){
              throw new Error("Fields Cannot be Empty")
          }

         const ifExists = await SuperAdmin.findOne({ email }).select("+password")

         if (!ifExists) {
                   throw new Error("Invalid Credentials")
         }
         const isValid = await ifExists.isPasswordCorrect(password)

        if (!isValid) {
          throw new Error("Invalid Credentials")
         }
         const token = await ifExists.getToken()
         const safeAdmin = ifExists.toObject();
         delete safeAdmin.password;

         res.cookie("token", token, { expires: new Date(Date.now() + 1 * 3600000) })
         return res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          user: safeAdmin,
         })
         
       } catch (error) {
          return res.status(500).json({ success: false, message: error.message })
       }
}
 
export const superAdminSignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
 
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    } 
    const existing = await SuperAdmin.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Super admin already exists with this email",
      });
    }
 
    const admin = await SuperAdmin.create({
      name,
      email,
      password,
    });
 
    const token = await admin.getToken();
 
    const safeAdmin = admin.toObject();
    delete safeAdmin.password;

    // 6. Send response
    return res.status(201).json({
      success: true,
      message: "Super admin created successfully",
      token,
      admin: safeAdmin,
    });

  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
 
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
 
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
 
    const isMatch = await user.isPasswordCorrect(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
 
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },"perfu3worf",
      { expiresIn: "7d" }
    );
 
    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const userSignUp = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

   
    if (!name || !email || !password || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const user = await User.create({
      name,
      email,
      password,
      location,
    });

    await SuperAdmin.findOneAndUpdate(
      {},
      {
        $inc: { "platformStats.totalUsers": 1 },
        $set: { lastLogin: new Date() },
      },
      { sort: { createdAt: 1 } },
    );

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      role: user.role,
    }; 

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: safeUser,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
