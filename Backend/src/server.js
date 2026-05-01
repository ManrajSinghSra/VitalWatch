import "dotenv/config";
import http from "http";

import { connectDB } from "./db/db.js";
import { app } from "./app.js";
import { connectGridFS } from "./db/gridfs.js"; // 🔥 ADD THIS

const server = http.createServer(app);
const port = 6001;

const turboEngine = async () => {
  await connectDB();
  console.log("Database Connected");

  connectGridFS(); // 🔥 ADD THIS LINE (VERY IMPORTANT)

  server.listen(port, () => {
    console.log("Working on Port " + port);
  });
};

turboEngine();