import { Router } from "express";
import { getMe, login, logout, register} from "../controllers/auth.controller.js";
import { Auth, verifyToken } from "../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", register); 
authRouter.post("/login",    login);      
authRouter.post("/logout",   verifyToken, logout);
authRouter.get ("/me",       Auth, getMe);