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
dashboardRoutes.get("/user-risk", async (req, res) => {
  try {
    const { state } = req.query;
    
    if (!state || !state.trim()) {
      return res.json({ 
        risk: null, 
        label: "no location set", 
        state: null 
      });
    }

    const data = await ReportChunk.aggregate([
      { 
        $match: { 
          "metadata.state": new RegExp(state.trim(), "i") 
        } 
      },
      {
        $group: {
          _id: null,
          totalCases: { $sum: "$metadata.cases" },
          totalDeaths: { $sum: "$metadata.deaths" },
          outbreaks: { $sum: 1 },
          diseases: { $addToSet: "$metadata.disease" },
          districts: { $addToSet: "$metadata.district" },
        }
      }
    ]);

    if (data.length === 0) {
      return res.json({
        risk: "none",
        label: "no recent outbreaks",
        state,
        cases: 0,
        deaths: 0,
        outbreaks: 0,
        diseases: [],
      });
    }

    const { totalCases, totalDeaths, outbreaks, diseases } = data[0];

    // Risk scoring rules
    let risk, label;
    if (totalDeaths > 0 || totalCases > 300) {
      risk = "high";
      label = "high risk";
    } else if (totalCases > 100 || outbreaks > 5) {
      risk = "moderate";
      label = "moderate risk";
    } else if (outbreaks > 0) {
      risk = "low";
      label = "low risk";
    } else {
      risk = "none";
      label = "no recent outbreaks";
    }

    return res.json({
      risk,
      label,
      state,
      cases: totalCases,
      deaths: totalDeaths,
      outbreaks,
      diseases: (diseases || []).filter(Boolean).slice(0, 3),
    });
  } catch (err) {
    console.error("user-risk error:", err);
    return res.status(500).json({ message: "Failed to compute user risk" });
  }
});
