import "dotenv/config.js"
import http from "http"

import { connetDB } from "./db/db.js"
import {app} from "./app.js"

const server=http.createServer(app)
const port=process.env.PORT


const turboEngine=async()=>{
   await connetDB()
    console.log("Database Connected");
    server.listen(port,()=>console.log("Working on Port "+port))
}

turboEngine()
