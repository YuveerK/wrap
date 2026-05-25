import { buildApp } from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./libraries/logger.js";
import { prisma } from "./libraries/prisma.js";

const app = buildApp();
const server = app.listen(config.port, () => {
  logger.info({ port: config.port }, "server up");
});

let shuttingDown = false;
async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info("shutting down");

  server.close(async () => {
    await prisma.$disconnect();
    logger.info("shutdown complete");
    process.exit(code);
  });

  setTimeout(() => {
    logger.error("forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "unhandledRejection");
  throw reason;
});
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaughtException — exiting");
  shutdown(1);
});
process.on("SIGTERM", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));
