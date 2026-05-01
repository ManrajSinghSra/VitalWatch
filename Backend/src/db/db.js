import mongoose from "mongoose";
import { connectGridFS } from "./gridfs.js";

export const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://srasinghmanraj:MynameisKhan1!@moon.sff0jqt.mongodb.net/VitaWatch",
  );
   connectGridFS();
};
 
export const connetDB = connectDB;
