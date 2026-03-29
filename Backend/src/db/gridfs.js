import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let bucket;

export const connectGridFS = () => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Database not connected yet");
  }

  bucket = new GridFSBucket(db, {
    bucketName: "reports",
  });
  console.log("GridFS bucket ready (reports)");
};

export const getBucket = () => {
  if (!bucket) throw new Error("GridFS bucket not initialized");
  return bucket;
};