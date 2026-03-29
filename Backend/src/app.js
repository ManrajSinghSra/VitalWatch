import express from "express"

import cookie  from "cookie-parser"
import cors from "cors"
export const app=express()


import { userRouter } from "./routers/user.js"
import { projectRouter } from "./routers/project.js"
import { reportRouter } from "./routers/reportProcessing.js"

app.use(express.json())
app.use(cookie())

app.use(cors({
    origin: "http://localhost:5173",  
    credentials: true,
  }))
  

app.use("/user",userRouter);
app.use("/project",projectRouter)
app.use("/report",reportRouter);

 