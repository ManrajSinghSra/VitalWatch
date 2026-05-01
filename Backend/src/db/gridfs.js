// db/gridfs.js
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let bucket;

export const connectGridFS = () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "reports",  
  });
  console.log("✅ GridFS bucket connected");
};

export const getBucket = () => {
  if (!bucket) {
    throw new Error("GridFS bucket not initialized. Call connectGridFS() first.");
  }
  return bucket;
};