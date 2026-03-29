import express from "express"

import cookie  from "cookie-parser"
import cors from "cors"
export const app=express()

 
import { reportRouter } from "./routers/reportProcessing.js"
import { userRouter } from "./routers/usersLogin.js"

app.use(express.json())
app.use(cookie())

app.use(cors({
    origin: "http://localhost:5173",  
    credentials: true,
  }))
    
app.use("/report",reportRouter);

app.use("/user",userRouter)

 