import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

import "dotenv/config";
import http from "http";

import { connectDB } from "./db/db.js";
import { app } from "./app.js";
import { connectGridFS } from "./db/gridfs.js";

const server = http.createServer(app);
const port = 6001;

const turboEngine = async () => {
  await connectDB();
  console.log("Database Connected");

  connectGridFS();

  server.listen(port, () => {
    console.log("Working on Port " + port);
  });
};

turboEngine();