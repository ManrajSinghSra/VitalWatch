import mongoose from "mongoose"

export const connetDB=async()=>{
   await mongoose.connect("mongodb+srv://srasinghmanraj:MynameisKhan1!@moon.sff0jqt.mongodb.net/Fit")
}