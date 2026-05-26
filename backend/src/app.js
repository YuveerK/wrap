import { randomUUID } from "node:crypto";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import { config } from "./config/index.js";
import { logger } from "./libraries/logger.js";
import { prisma } from "./libraries/prisma.js";
import { errorHandler } from "./middleware/error-handler.js";
import { multerErrorMiddleware } from "./multer/multer-error.middleware.js";
import usersRouter from "./components/users/users.routes.js";
import authRouter from "./components/auth/auth.routes.js";
import issuesRouter from "./components/issues/issues.routes.js";
import postsRouter from "./components/posts/posts.routes.js";

export function buildApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("query parser", "simple");

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin.split(","), credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));
  app.use(cookieParser());

  app.use((req, res, next) => {
    req.id = req.headers["x-request-id"] ?? randomUUID();
    res.setHeader("x-request-id", req.id);
    next();
  });

  app.use(pinoHttp({ logger, customProps: (req) => ({ requestId: req.id }) }));

  app.get("/healthz", (req, res) => res.json({ status: "ok" }));
  app.use(
    config.upload.publicBaseUrl,
    express.static(config.upload.publicDir),
  );

  app.get("/readyz", async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "ready" });
    } catch {
      res.status(503).json({ status: "not ready" });
    }
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/issues", issuesRouter);
  app.use("/api/posts", postsRouter);
  app.use(multerErrorMiddleware);
  app.use(errorHandler);

  return app;
}
