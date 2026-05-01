import mongoose from "mongoose";
import dotenv from "dotenv";
import { SuperAdmin } from "../models/SuperAdmin.js";
import { connectDB } from "../db/db.js";

dotenv.config();

const createSuperAdmin = async () => {
  try { 

    connectDB()
    const existing = await SuperAdmin.findOne({ role: "superadmin" });
    if (existing) {
      console.log("⚠️  SuperAdmin already exists:", existing.email);
      process.exit(0);
    } 
    const superAdmin = await SuperAdmin.create({
      name:     "Dr. Meera Joshi",
      email:    "superadmin@vitalwatch.in",   
      password: "12345678",      
      role:     "superadmin",
      platformStats: {
        totalUsers:       0,
        totalAdmins:      0,
        reportsProcessed: 0,
        aiQueriesToday:   0,
        apiCallsTotal:    0,
        uptime:           "100%",
      },
    });

    console.log("  SuperAdmin created successfully!");
    console.log("   Email   :", superAdmin.email);
    console.log("   Name    :", superAdmin.name);
    console.log("   Role    :", superAdmin.role);
    console.log(" Share these credentials privately with the SuperAdmin.");
    console.log("   DO NOT commit this file with real credentials to GitHub!");

  } catch (err) {
    console.error("Error creating SuperAdmin:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};
// fu
createSuperAdmin();
