// routes/dashboard.routes.js (new file)
import express from "express";
import { ReportChunk } from "../models/ReportChunk.js";

export const dashboardRoutes = express.Router();
 
dashboardRoutes.get("/outbreaks-by-state", async (req, res) => {
  try {
    const { week, year } = req.query; // optional filters
    
    const match = { "metadata.state": { $ne: null } };
    if (week) match["metadata.weekNumber"] = parseInt(week, 10);
    if (year) match["metadata.year"] = parseInt(year, 10);
    
    const data = await ReportChunk.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$metadata.state",
          totalOutbreaks: { $sum: 1 },
          totalCases: { $sum: "$metadata.cases" },
          totalDeaths: { $sum: "$metadata.deaths" },
          diseases: { $addToSet: "$metadata.disease" },
          districts: { $addToSet: "$metadata.district" }
        }
      },
      { $sort: { totalCases: -1 } }
    ]);
    
    return res.json({ states: data });
  } catch (err) {
    console.error("outbreaks-by-state error:", err);
    return res.status(500).json({ message: "Failed to fetch state data" });
  }
});
 
dashboardRoutes.get("/outbreaks-by-week", async (req, res) => {
  try {
    const data = await ReportChunk.aggregate([
      {
        $match: {
          "metadata.weekNumber": { $ne: null },
          "metadata.year": { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            year: "$metadata.year",
            week: "$metadata.weekNumber",
            disease: "$metadata.disease"
          },
          cases: { $sum: "$metadata.cases" },
          deaths: { $sum: "$metadata.deaths" },
          outbreaks: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);
    
    return res.json({ weeks: data });
  } catch (err) {
    console.error("outbreaks-by-week error:", err);
    return res.status(500).json({ message: "Failed to fetch weekly data" });
  }
});
 
dashboardRoutes.get("/state-detail/:state", async (req, res) => {
  try {
    const stateName = req.params.state;
    
    const outbreaks = await ReportChunk.find(
      { "metadata.state": new RegExp(`^${stateName}$`, "i") },
      { embedding: 0 }
    )
    .sort({ "metadata.year": -1, "metadata.weekNumber": -1 })
    .limit(50)
    .lean();
    
    return res.json({ state: stateName, outbreaks });
  } catch (err) {
    console.error("state-detail error:", err);
    return res.status(500).json({ message: "Failed to fetch state details" });
  }
});
