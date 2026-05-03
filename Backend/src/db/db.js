import mongoose from "mongoose";
import { connectGridFS } from "./gridfs.js";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://srasinghmanraj:MynameisKhan1!@moon.sff0jqt.mongodb.net/VitaWatch";

export const connectDB = async () => {
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  connectGridFS();
};

export const connetDB = connectDB;
