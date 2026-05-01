// utils/updateStats.js
import { SuperAdmin } from "../models/SuperAdmin.js";

// helper to get superadmin document
const getSA = async () => {
  return await SuperAdmin.findOne({ role: "superadmin" });
};

export const incrementTotalUsers = async () => {
  try {
    await SuperAdmin.findOneAndUpdate(
      { role: "superadmin" },
      { $inc: { "platformStats.totalUsers": 1 } }
    );
  } catch (err) {
    console.error("incrementTotalUsers failed:", err.message);
  }
};

export const incrementTotalAdmins = async () => {
  try {
    await SuperAdmin.findOneAndUpdate(
      { role: "superadmin" },
      { $inc: { "platformStats.totalAdmins": 1 } }
    );
  } catch (err) {
    console.error("incrementTotalAdmins failed:", err.message);
  }
};

export const decrementTotalAdmins = async () => {
  try {
    await SuperAdmin.findOneAndUpdate(
      { role: "superadmin" },
      { $inc: { "platformStats.totalAdmins": -1 } }
    );
  } catch (err) {
    console.error("decrementTotalAdmins failed:", err.message);
  }
};

export const incrementReportsProcessed = async () => {
  try {
    await SuperAdmin.findOneAndUpdate(
      { role: "superadmin" },
      { $inc: { "platformStats.reportsProcessed": 1 } }
    );
  } catch (err) {
    console.error("incrementReportsProcessed failed:", err.message);
  }
};

export const incrementAiQueries = async () => {
  try {
    await SuperAdmin.findOneAndUpdate(
      { role: "superadmin" },
      { $inc: { "platformStats.aiQueriesToday": 1 } }
    );
  } catch (err) {
    console.error("incrementAiQueries failed:", err.message);
  }
};

export const incrementApiCalls = async () => {
  try {
    await SuperAdmin.findOneAndUpdate(
      { role: "superadmin" },
      { $inc: { "platformStats.apiCallsTotal": 1 } }
    );
  } catch (err) {
    console.error("incrementApiCalls failed:", err.message);
  }
};

export const updateUptime = async () => {
  try {
    const seconds  = process.uptime();
    const hours    = Math.floor(seconds / 3600);
    const minutes  = Math.floor((seconds % 3600) / 60);
    const secs     = Math.floor(seconds % 60);
    const uptime   = `${hours}h ${minutes}m ${secs}s`;

    await SuperAdmin.findOneAndUpdate(
      { role: "superadmin" },
      { "platformStats.uptime": uptime }
    );
  } catch (err) {
    console.error("updateUptime failed:", err.message);
  }
};