import express from "express";  
import { superAdminLogin, superAdminSignUp } from "../controllers/user.js";
export const userRouter = express.Router(); 

userRouter.post("/login",userLogin);

userRouter.post("/signSuper",superAdminSignUp);
