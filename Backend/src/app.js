import express from "express"

import cookie  from "cookie-parser"
import cors from "cors"
export const app=express()
 
import { reportRouter } from "./routers/reportProcessing.routes.js"
import { adminRouter } from "./routers/admin.routes.js"
import { superAdminRouter } from "./routers/superadmin.routes.js"
import { authRouter } from "./routers/auth.routes.js"
import { userRouter } from "./routers/user.routes.js"
import { chatRouter } from "./routers/chat.routes.js"
import { dashboardRoutes } from "./routers/dashboard.routes.js"

app.use(express.json())
app.use(cookie())

app.use(cors({
    origin: "http://localhost:5173",  
    credentials: true,
  }))
    
app.use("/report",reportRouter);
 

app.use("/auth",       authRouter);
app.use("/superadmin", superAdminRouter);
app.use("/admin",      adminRouter);
app.use("/user",       userRouter);
app.use("/chat",       chatRouter);
app.use("/dashboard", dashboardRoutes);



 
