import mongoose from "mongoose";

const schema = new mongoose.Schema({
  reportId: mongoose.Schema.Types.ObjectId,
  text: String,
  embedding: [Number],
});

export const ReportChunk = mongoose.model("ReportChunk", schema);