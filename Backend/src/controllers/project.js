 
import mongoose from 'mongoose'
import { Project } from '../models/project.js'
import { User } from '../models/user.js'
import vali from  "validator"
export const create=async(req,res)=>{

    try {
        if(!req.body){
            throw new Error("Request Body cannot be empty")
        }
        const error=validationResult(req)
    
        if(!error.isEmpty){
            return res.status(400).json({error:error.array()})
        }  

    const {name,technologies,description}=req.body
    if(!name){
        throw new Error("Name Cannot be NULL")
    }

    const user=req.user
    if(!user){
        throw new Error("There should be no Project is there is no user")
    } 


    const ifExist=await Project.findOne({name})

    if(ifExist){
        throw new Error("Project already exists")
    }
    const newProject=await Project.create({name,description,technologies,users:user})
     
    res.status(200).json({data:newProject})
        
    } catch (error) {
        res.status(400).json({error:error.message})
    }


}

export const allProjects=async(req,res)=>{
    try {
        const {_id}=req.user

        const data=await Project.find({users:_id}).populate("users",["fullName.firstName"])

        if(data.length===0){
            return res.json({data:"No Projects"})
        }
        res.status(200).json({data})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}

export const addUser=async(req,res)=>{
    try {

        if(!req.body){
            throw new Error("Request Body cannot be empty")
        }
        const {_id}=req.user;

        const {usertoadd,projectId}=req.body;
        if(!usertoadd){
            throw new Error("User Email is Required")
        }
        if(!projectId){
            throw new Error("Project Id is Required")
        }
        if(!mongoose.isValidObjectId(projectId)){
            throw new Error("Project Id is not Valid")
        }
        
        const isValidate=await User.findOne({emailId:usertoadd})
        
        if(!isValidate){
            throw new Error("User does not Exist")
        }
        if(String(_id)==String(isValidate._id)){
          throw new Error("Cannot add youself")
      }
        const validateProject=await Project.findOne({_id:projectId,users:_id})
        if(!validateProject){
            throw new Error("Invalid Access")
        }
        const adreadyExists=await Project.findOne({_id:projectId,users:isValidate._id})
        if(adreadyExists){
            throw new Error("User is already in the project")
        }
      
        const newAdded=await Project.findByIdAndUpdate(projectId,{
             $addToSet:{
                users:   isValidate._id
             }
        })
        if(!newAdded){
            return res.status(409).json({error:"Filed to Send Requets"})
        }
        res.status(201).json({message:"User added to Project"})

    } catch (error) {
        res.status(400).json({error:error.message})
    }
}