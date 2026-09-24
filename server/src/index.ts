import mongoose from "mongoose";
import { createApp } from "./app";
import { config } from "./config";

async function startServer(): Promise<void> {
  try {
    console.log(`Connecting to MongoDB at: ${config.mongoUri}`);
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB successfully");

    const app = createApp();
    app.listen(config.port, () => {
      console.log(`Feedants Competition Server is running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}
