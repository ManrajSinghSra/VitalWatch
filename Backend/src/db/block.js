import mongoose from "mongoose";

const blockSchema=new mongoose.Schema({
    token:{
        type:String,
        required:true
    },
    
})