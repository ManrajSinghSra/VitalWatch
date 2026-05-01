import express from "express"

import cookie  from "cookie-parser"
import cors from "cors"
export const app=express()

 
import { reportRouter } from "./routers/reportProcessing.js"
import { adminRouter } from "./routers/admin.router.js"
import { superAdminRouter } from "./routers/superadmin.router.js"
import { authRouter } from "./routers/auth.router.js"
import { userRouter } from "./routers/user.router.js"
import { chatRouter } from "./routers/chat.router.js"

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



 
