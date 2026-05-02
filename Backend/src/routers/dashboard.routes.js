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

dashboardRoutes.get("/disease-summary", async (req, res) => {
  try {
    const data = await ReportChunk.aggregate([
      { $match: { "metadata.disease": { $ne: null } } },
      {
        $group: {
          _id: "$metadata.disease",
          totalCases: { $sum: "$metadata.cases" },
          totalDeaths: { $sum: "$metadata.deaths" },
          outbreaks: { $sum: 1 },
          states: { $addToSet: "$metadata.state" },
        },
      },
      { $sort: { totalCases: -1 } },
      { $limit: 15 },
    ]);

    return res.json({ diseases: data });
  } catch (err) {
    console.error("disease-summary error:", err);
    return res.status(500).json({ message: "Failed to fetch disease summary" });
  }
});

// GET /dashboard/alerts
// Returns prioritized outbreak alerts: deaths first, then large outbreaks, then most recent
dashboardRoutes.get("/alerts", async (req, res) => {
  try {
    // Get latest week to know what counts as "recent"
    const latestChunk = await ReportChunk.findOne({
      "metadata.weekNumber": { $ne: null },
    })
      .sort({ "metadata.year": -1, "metadata.weekNumber": -1 })
      .select("metadata.year metadata.weekNumber")
      .lean();

    const latestWeek = latestChunk?.metadata?.weekNumber;
    const latestYear = latestChunk?.metadata?.year;

    // Pull all outbreaks, score them, return top N
    const outbreaks = await ReportChunk.find(
      { "metadata.disease": { $ne: null } },
      { embedding: 0, text: 0 }
    )
      .lean();

    const alerts = outbreaks
      .map((o) => {
        const m = o.metadata || {};
        let priority = 0;
        let urgency = "info";
        let reason = "";

        // Priority scoring
        if (m.deaths > 0) {
          priority += 1000 + m.deaths * 10;
          urgency = "danger";
          reason = `${m.deaths} death${m.deaths !== 1 ? "s" : ""} reported`;
        } else if (m.cases >= 100) {
          priority += 500 + m.cases;
          urgency = "warning";
          reason = `Large outbreak — ${m.cases} cases`;
        } else if (m.cases >= 25) {
          priority += 100 + m.cases;
          urgency = "info";
          reason = `${m.cases} cases reported`;
        } else {
          priority += m.cases || 0;
          urgency = "info";
          reason = `${m.cases || 0} cases`;
        }

        // Boost recent week
        if (m.weekNumber === latestWeek && m.year === latestYear) {
          priority += 50;
        }

        // Status-based urgency override
        if (m.status === "Under Control") {
          urgency = urgency === "danger" ? "danger" : "success";
        }

        return {
          id: o._id,
          urgency,
          reason,
          disease: m.disease,
          state: m.state,
          district: m.district,
          cases: m.cases || 0,
          deaths: m.deaths || 0,
          week: m.weekNumber,
          year: m.year,
          status: m.status,
          startDate: m.startDate,
          isLatest: m.weekNumber === latestWeek && m.year === latestYear,
          priority,
        };
      })
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 20);

    return res.json({ alerts, latestWeek, latestYear });
  } catch (err) {
    console.error("alerts error:", err);
    return res.status(500).json({ message: "Failed to fetch alerts" });
  }
});
