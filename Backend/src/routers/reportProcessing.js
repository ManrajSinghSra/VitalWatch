// routers/reportProcessing.js
import { Router } from "express";
import multer from "multer";
import {
  uploadFile,
  getAllReports,
  downloadReport,
  deleteReport,
} from "../controllers/report.js";
 
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (req, file, cb) => {
    // only allow PDFs and common doc types
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF / DOC / DOCX files are allowed"), false);
    }
  },
});

export const reportRouter = Router();
 
reportRouter.post("/upload", upload.single("file"), uploadFile);
 
reportRouter.get("/all", getAllReports);
 
reportRouter.get("/download/:id", downloadReport);
 
reportRouter.delete("/:id", deleteReport);