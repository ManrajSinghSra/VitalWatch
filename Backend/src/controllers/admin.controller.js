import { Readable } from "stream";
import { User } from "../models/User.js";
import { Report } from "../models/Report.js";
import { AuditLog } from "../models/AuditLog.js";
import { getBucket } from "../db/gridfs.js";
import { incrementReportsProcessed } from "../utils/updateStats.js";
import { ingestReport } from "../services/rag/ingest.service.js"; // 🔥 ADDED

const hasAdminPermission = (user, permission) => {
  if (user?.role === "superadmin") return true;
  return user?.hasPermission?.(permission) === true;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /admin/report/upload
// ─────────────────────────────────────────────────────────────────────────────
export const uploadReport = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const { source = "Other", description = "" } = req.body;

    // stream buffer → GridFS
    const bucket = getBucket();
    const readableStream = Readable.from(file.buffer);
    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: { source, description, uploadedBy: req.user._id },
    });

    await new Promise((resolve, reject) => {
      readableStream.pipe(uploadStream);
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    // save metadata to reports collection
    const report = await Report.create({
      originalName: file.originalname,
      gridfsFileId: uploadStream.id,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      source,
      description,
      status: "uploaded",
      uploadedBy: req.user._id,
    });

    // audit log (do this BEFORE responding, so failure is logged synchronously)
    await AuditLog.create({
      level: "INFO",
      action: `Admin uploaded report: ${file.originalname}`,
      performedBy: req.user.name,
      performedById: req.user._id,
    });

    // respond to client immediately — don't make them wait for ingestion
    res.status(201).json({
      message: "Report uploaded successfully. RAG ingestion in progress.",
      report: {
        id: report._id,
        originalName: report.originalName,
        source: report.source,
        status: report.status,
        sizeBytes: report.sizeBytes,
        createdAt: report.createdAt,
      },
    });

    // 🔥 RAG ingestion runs in background AFTER response is sent
    // stats only increment if ingestion actually succeeds
    console.log("🔥 Starting RAG ingestion in background...");

    ingestReport(report)
      .then(async () => {
        console.log(`✅ RAG processed: ${report.originalName}`);
        try {
          await incrementReportsProcessed();
        } catch (statErr) {
          console.error("⚠️ Stats increment failed:", statErr.message);
        }
      })
      .catch(async (err) => {
        console.error(`❌ RAG ingestion failed for ${report.originalName}:`, err.message);
        try {
          await AuditLog.create({
            level: "DANGER",
            action: `RAG ingestion failed for ${report.originalName}: ${err.message}`,
            performedBy: req.user.name,
            performedById: req.user._id,
          });
        } catch (logErr) {
          console.error("⚠️ Audit log for failed ingestion also failed:", logErr.message);
        }
      });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({
      message: "Upload failed",
      error: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/report/all
// ─────────────────────────────────────────────────────────────────────────────
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email");

    return res.status(200).json({ reports });

  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch reports" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/report/download/:id
// ─────────────────────────────────────────────────────────────────────────────
export const downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const bucket = getBucket();

    res.set("Content-Type", report.mimeType);
    res.set("Content-Disposition", `attachment; filename="${report.originalName}"`);

    const downloadStream = bucket.openDownloadStream(report.gridfsFileId);

    downloadStream.on("error", () => {
      return res.status(404).json({ message: "File not found in storage" });
    });

    downloadStream.pipe(res);

  } catch (err) {
    return res.status(500).json({ message: "Download failed" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /admin/report/:id/status
// ─────────────────────────────────────────────────────────────────────────────
export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["uploaded", "processing", "processed", "failed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(", ")}` });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!report) return res.status(404).json({ message: "Report not found" });

    await AuditLog.create({
      level: "INFO",
      action: `Report status updated to "${status}": ${report.originalName}`,
      performedBy: req.user.name,
      performedById: req.user._id,
    });

    return res.status(200).json({ message: "Status updated", report });

  } catch (err) {
    return res.status(500).json({ message: "Status update failed" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /admin/report/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (!hasAdminPermission(req.user, "canDeleteReports")) {
      return res.status(403).json({ message: "You don't have permission to delete reports" });
    }

    const bucket = getBucket();

    await bucket.delete(report.gridfsFileId);
    await Report.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      level: "DANGER",
      action: `Deleted report: ${report.originalName}`,
      performedBy: req.user.name,
      performedById: req.user._id,
    });

    return res.status(200).json({ message: "Report deleted successfully" });

  } catch (err) {
    return res.status(500).json({ message: "Delete failed" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/users
// ─────────────────────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    if (!hasAdminPermission(req.user, "canViewUsers")) {
      return res.status(403).json({ message: "You don't have permission to view users" });
    }

    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({ users });

  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};