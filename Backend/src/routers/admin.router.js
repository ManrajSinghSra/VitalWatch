import { Router } from "express";
import multer from "multer";
import {
  deleteReport,
  downloadReport,
  getAllReports,
  getAllUsers,
  updateReportStatus,
  uploadReport,
} from "../controllers/admin.controller.js";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF / DOC / DOCX files are allowed"), false);
    }
  },
});

export const adminRouter = Router();

adminRouter.use(verifyToken, isAdmin);

adminRouter.post("/report/upload", upload.single("file"), uploadReport);
adminRouter.get("/report/all", getAllReports);
adminRouter.get("/report/download/:id", downloadReport);
adminRouter.patch("/report/:id/status", updateReportStatus);
adminRouter.delete("/report/:id", deleteReport);
adminRouter.get("/users", getAllUsers);
