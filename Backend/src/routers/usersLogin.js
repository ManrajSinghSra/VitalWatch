import express from "express";  
import { superAdminLogin, superAdminSignUp, userLogin, userSignUp } from "../controllers/user.js";
export const userRouter = express.Router(); 

userRouter.post("/loginSuper",superAdminLogin);

userRouter.post("/signSuper",superAdminSignUp);


userRouter.post("/loginUser",userLogin)

userRouter.post("/signUpUser",userSignUp)