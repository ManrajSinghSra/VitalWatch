import express from "express";  
import { superAdminLogin, superAdminSignUp } from "../controllers/user.js";
export const userRouter = express.Router(); 

userRouter.post("/loginSuper",superAdminLogin);

userRouter.post("/signSuper",superAdminSignUp);
