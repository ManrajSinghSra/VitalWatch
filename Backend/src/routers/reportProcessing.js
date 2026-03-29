import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/report.js";

const upload = multer({ dest: "uploads/" });

export const reportRouter = Router();

reportRouter.post("/upload", upload.single("file"), uploadFile);