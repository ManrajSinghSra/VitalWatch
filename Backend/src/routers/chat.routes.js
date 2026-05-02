import { Router } from "express";
import { sendMessage } from "../controllers/chat.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

export const chatRouter = Router();

chatRouter.post("/message", verifyToken, sendMessage);
