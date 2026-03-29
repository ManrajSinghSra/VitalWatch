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
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);