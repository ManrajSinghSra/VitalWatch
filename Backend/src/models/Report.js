// models/Report.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },

    gridfsFileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    sizeBytes: {
      type: Number,
      required: true,
    },

    source: {
      type: String,
      enum: ["IDSP", "WHO", "NCDC", "State", "News", "Other"],
      default: "Other",
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["uploaded", "processing", "processed", "failed"],
      default: "uploaded",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);