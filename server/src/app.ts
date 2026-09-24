import express, { Application } from "express";
import cors from "cors";
import competitionRoutes from "./routes/competitionRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { config } from "./config";

export function createApp(): Application {
  const app = express();

  // Cross-origin resource sharing & JSON parsing
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json());

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use("/api/competitions", competitionRoutes);
  app.use("/api/users", userRoutes);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
