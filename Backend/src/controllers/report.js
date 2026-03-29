// controllers/report.js
import { Readable } from "stream";
import mongoose from "mongoose";
import { getBucket } from "../db/gridfs.js";
import { Report } from "../models/Report.js";
 
export const uploadFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { source = "Other", description = "" } = req.body;

    // ── Step 1: Stream buffer → GridFS ──────────────────────────────────────
    const bucket = getBucket();

    // Convert the in-memory buffer to a readable stream
    const readableStream = Readable.from(file.buffer);

    // Open an upload stream into GridFS
    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: { source, description },
    });

    // Pipe the file buffer into GridFS
    await new Promise((resolve, reject) => {
      readableStream.pipe(uploadStream);
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    const gridfsFileId = uploadStream.id; // MongoDB ObjectId of the stored file

    // ── Step 2: Save metadata to MongoDB reports collection ─────────────────
    const report = await Report.create({
      originalName: file.originalname,
      gridfsFileId,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      source,
      description,
      status: "uploaded",
      // uploadedBy: req.user._id,  ← uncomment once auth middleware is added
    });

    console.log(`📄 File uploaded: ${file.originalname} → GridFS ID: ${gridfsFileId}`);

    return res.status(201).json({
      message: "File uploaded successfully",
      report: {
        id: report._id,
        originalName: report.originalName,
        source: report.source,
        status: report.status,
        sizeBytes: report.sizeBytes,
        createdAt: report.createdAt,
        gridfsFileId: report.gridfsFileId,
      },
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
};
 
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })   // newest first
      .select("-__v");           // hide mongoose version key

    return res.status(200).json({ reports });

  } catch (err) {
    console.error("Get reports error:", err);
    return res.status(500).json({ message: "Failed to fetch reports" });
  }
};

 
export const downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const bucket = getBucket();

    // Set headers so browser knows it's a PDF download
    res.set("Content-Type", report.mimeType);
    res.set("Content-Disposition", `attachment; filename="${report.originalName}"`);

    // Open a download stream from GridFS using the stored ObjectId
    const downloadStream = bucket.openDownloadStream(report.gridfsFileId);

    downloadStream.on("error", () => {
      return res.status(404).json({ message: "File not found in storage" });
    });

    // Pipe GridFS stream directly to HTTP response
    downloadStream.pipe(res);

  } catch (err) {
    console.error("Download error:", err);
    return res.status(500).json({ message: "Download failed" });
  }
};

 
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const bucket = getBucket();

    // Step 1: Delete file bytes from GridFS
    await bucket.delete(report.gridfsFileId);

    // Step 2: Delete metadata from MongoDB
    await Report.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Deleted report: ${report.originalName}`);

    return res.status(200).json({ message: "Report deleted successfully" });

  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ message: "Delete failed", error: err.message });
  }
};