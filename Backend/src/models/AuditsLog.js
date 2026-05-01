// models/AuditLog.js
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["INFO", "WARN", "DANGER"],
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    performedBy: {
      type: String,
      required: true,
    },

    performedById: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // null for system actions
    },
  },
  { timestamps: true } // createdAt auto set
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);