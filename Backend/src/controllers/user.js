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
 
export const superAdminSignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
 
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    } 
    const existing = await SuperAdmin.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Super admin already exists with this email",
      });
    }
 
    const admin = await SuperAdmin.create({
      name,
      email,
      password,
    });
 
    const token = await admin.getToken();
 
    const safeAdmin = admin.toObject();
    delete safeAdmin.password;
 
    return res.status(201).json({
      success: true,
      message: "Super admin created successfully",
      token,
      admin: safeAdmin,
    });

  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};