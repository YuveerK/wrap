import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import usersRouter from "./components/users/users.routes.js";

export function buildApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: config.corsOrigin.split(","), credentials: true }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/healthz", (req, res) => res.json({ status: "ok" }));

  app.use("/api/users", usersRouter);

  app.use(errorHandler);

  return app;
}
