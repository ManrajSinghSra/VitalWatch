import { SuperAdmin } from "../models/superAdmin.js";
 

export const superAdminLogin=async(req,res)=>{


       try {
          const {email,password}=req.body;


          if( !email || !password){
              throw new Error("Fields Cannot be Empty")
          }

         const ifExists = await SuperAdmin.findOne({ email })

         if (!ifExists) {
                   throw new Error("Invalid Credentials")
         }
          const isValid = await ifExists.isPasswordCorrect(password)

        if (!isValid) {
          throw new Error("Invalid Credentials")
         }
         const token = await ifExists.getToken()
         res.cookie("token", token, { expires: new Date(Date.now() + 1 * 3600000) })
         return res.status(200).json({ data: ifExists })
         
       } catch (error) {
          res.json({ error: error.message })
         
       }
}
 
