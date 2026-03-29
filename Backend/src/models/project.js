import mongoose from "mongoose"

const projectSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
        unique:true,
        lowercase:true,

    },
    technologies:{
        type:String,
        trim:true,
        required:true,
        lowercase:true,
        maxLength:[50,"Tech name cannot be that long"],
    },
    description:{
       type:String,
       trim:true,
       required:true,
       lowercase:true,
       maxLength:[255,"Descrition cannot be that much length"]
    },
    users:[
       { 
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
       }
    ]
},{timestamps:true})

export const Project=mongoose.model("project",projectSchema)