import "dotenv/config";
import http from "http";

import { connectDB } from "./db/db.js";
import { app } from "./app.js";

const server = http.createServer(app);
const port = 6001;

const turboEngine = async () => {
  await connectDB();
  console.log("Database Connected");

  server.listen(port, () => {
    console.log("Working on Port " + port);
  });
};

turboEngine();