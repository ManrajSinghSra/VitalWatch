import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

export const userRouter = Router();

userRouter.use(verifyToken);

userRouter.get("/profile", getProfile);
userRouter.patch("/profile", updateProfile);
