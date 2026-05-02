import mongoose from "mongoose";

const reportChunkSchema = new mongoose.Schema({
  reportId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Report", 
    required: true,
    index: true 
  },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  
  // 🔥 NEW: structured metadata for filtering
  metadata: {
    state: { type: String, index: true },
    district: { type: String, index: true },
    disease: { type: String, index: true },
    cases: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 },
    startDate: String,
    status: String,
    uniqueId: String,
    chunkType: { 
      type: String, 
      enum: ["outbreak_entry", "summary", "header", "fallback"],
      default: "outbreak_entry"
    }
  },
  
  createdAt: { type: Date, default: Date.now }
});

// compound index for filtered vector searches
reportChunkSchema.index({ "metadata.state": 1, "metadata.disease": 1 });

export const ReportChunk = mongoose.model("ReportChunk", reportChunkSchema);