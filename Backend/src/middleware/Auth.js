import jwt from  "jsonwebtoken"
import { User } from "../models/user.js";
export const Auth=async(req,res,next)=>{

   try{
     const token=req.cookies.token 
    
    if(!token){
        return res.status(401).json({error:"Please Login"})
    }
  
          res.clearCookie("token") 
    
    const {_id}=jwt.verify(token,process.env.SECRET);
    const user=await User.findById(_id);
    if(!user){
        return res.status(401).json({error:"Unauthorized"})
    }
    req.user=user
    next()}
   catch(e){

    return res.json({error:e.message})

   }
}