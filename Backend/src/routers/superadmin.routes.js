import { Router } from "express";
import { verifyToken, isSuperAdmin } from "../middleware/auth.middleware.js";
import {
  banUser,
  deleteUser,
  demoteToUser,
  getAllUsers,
  getAuditLogs,
  getStats,
  promoteToAdmin,
  unbanUser, 
} from "../controllers/superadmin.controller.js"; 

export const superAdminRouter = Router();
 
superAdminRouter.use(verifyToken, isSuperAdmin);

superAdminRouter.get   ("/stats",          getStats);        
superAdminRouter.get   ("/users",          getAllUsers);      
superAdminRouter.patch ("/promote/:userId", promoteToAdmin);  
superAdminRouter.patch ("/demote/:userId",  demoteToUser);   
superAdminRouter.patch ("/ban/:userId",     banUser); 
superAdminRouter.patch ("/unban/:userId",   unbanUser);
superAdminRouter.delete("/delete/:userId",  deleteUser);
superAdminRouter.get   ("/audit-logs",      getAuditLogs);
 