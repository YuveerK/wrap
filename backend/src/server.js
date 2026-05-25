import { buildApp } from "./app.js";
import { config } from "./config/index.js";
import { prisma } from "./libraries/prisma.js";

const app = buildApp();
const server = app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});

let shuttingDown = false;
async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(code);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("unhandledRejection", (reason) => { throw reason; });
process.on("uncaughtException", (err) => {
  console.error(err);
  shutdown(1);
});
process.on("SIGTERM", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));
