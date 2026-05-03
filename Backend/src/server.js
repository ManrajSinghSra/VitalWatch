import "dotenv/config";
import http from "http";

import { connectDB } from "./db/db.js";
import { app } from "./app.js";

const server = http.createServer(app);
const port = process.env.PORT || 6001;

const turboEngine = async () => {
  try {
    await connectDB();
    console.log("Database Connected");

    server.listen(port, () => {
      console.log("Working on Port " + port);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

turboEngine();
