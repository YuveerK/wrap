# Backend Best Practices

A practical guide for this backend (`express ^5.2.1`, `@prisma/client ^7.8.0`, `pg ^8.21.0`, ESM, Node 22+).

Adapted from [goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices) and filtered down to what actually applies to _this_ stack — no Docker chapter, no TypeScript chapter, no callbacks chapter. The examples below assume your `package.json` (ESM, `"type": "module"`).

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Error Handling](#2-error-handling)
3. [Code Style](#3-code-style)
4. [Configuration & Secrets](#4-configuration--secrets)
5. [Express 5 Specifics](#5-express-5-specifics)
6. [Prisma 7 & Postgres](#6-prisma-7--postgres)
7. [Security](#7-security)
8. [Logging & Observability](#8-logging--observability)
9. [Going to Production](#9-going-to-production)
10. [Testing](#10-testing)
11. [Recommended Additions to package.json](#11-recommended-additions-to-packagejson)

---

## 1. Project Structure

### 1.1 Structure by business components, not by technical role

Avoid the classic `controllers/`, `services/`, `models/`, `routes/` top-level folders once you grow past ~5 endpoints. Group by feature instead. Each component owns its own routes, domain logic, and data access. This is how Jobox-scale codebases stay sane.

```
src/
├── server.js              # bootstrap only
├── app.js                 # express app factory (export, don't listen)
├── config/                # env loading, validation
├── components/
│   ├── users/
│   │   ├── users.routes.js
│   │   ├── users.controller.js
│   │   ├── users.service.js     # business logic, no req/res here
│   │   └── users.repository.js  # all Prisma calls live here
│   ├── jobs/
│   └── applications/
├── libraries/             # cross-cutting: logger, errors, db client
│   ├── logger.js
│   ├── errors.js
│   └── prisma.js
└── middleware/            # generic: error-handler, request-id, auth
```

**Why:** when you change something in `users`, you don't touch `jobs`. Tight blast radius. Easy to extract into a separate service later.

### 1.2 Keep `req` and `res` in the controller, never below it

The controller is the _only_ place that knows it's HTTP. Services take plain arguments and return plain values — they should be callable from a cron job, a queue consumer, or a test without any HTTP fakery.

```js
// ❌ Bad — service knows about Express
async function createUser(req, res) {
  const user = await prisma.user.create({ data: req.body });
  res.json(user);
}

// ✅ Good — service is pure
// users.service.js
export async function createUser(input) {
  return prisma.user.create({ data: input });
}

// users.controller.js
import * as userService from "./users.service.js";
export async function createUserHandler(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}
```

### 1.3 `server.js` boots, `app.js` builds

Split process concerns (signals, port binding, graceful shutdown) from the Express app definition. Tests can `import { app } from './app.js'` without starting a server.

```js
// src/app.js
import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler.js";
import { router } from "./routes.js";

export function buildApp() {
  const app = express();
  app.use(express.json({ limit: "100kb" }));
  app.use(cors({ origin: process.env.CORS_ORIGIN }));
  app.use("/api", router);
  app.use(errorHandler);
  return app;
}
```

```js
// src/server.js
import { buildApp } from "./app.js";
import { logger } from "./libraries/logger.js";
import { prisma } from "./libraries/prisma.js";

const app = buildApp();
const server = app.listen(process.env.PORT ?? 3000, () => {
  logger.info({ port: server.address().port }, "server up");
});

// graceful shutdown — see section 9.3
```

---

## 2. Error Handling

### 2.1 Extend `Error`, classify operational vs programmer errors

The single biggest improvement you can make to a Node backend. Every thrown error should be an instance of an `AppError` subclass with an HTTP status, a code, and an `isOperational` flag.

```js
// src/libraries/errors.js
export class AppError extends Error {
  constructor(
    message,
    { status = 500, code = "INTERNAL", isOperational = true, cause } = {},
  ) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details) {
    super(message, { status: 400, code: "VALIDATION_FAILED" });
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, { status: 404, code: "NOT_FOUND" });
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, { status: 409, code: "CONFLICT" });
  }
}
```

**Operational** = expected (bad input, missing row, duplicate key). Handle, respond, move on.
**Programmer** = unexpected (null deref, bug). Log, crash, let the orchestrator restart you.

### 2.2 One central error handler

Express 5 finally catches async errors from route handlers automatically — you no longer need `express-async-errors` or wrapping every handler in `try/catch`. But you _do_ still want a single funnel.

```js
// src/middleware/error-handler.js
import { AppError } from "../libraries/errors.js";
import { logger } from "../libraries/logger.js";

export function errorHandler(err, req, res, next) {
  const isOperational = err instanceof AppError && err.isOperational;

  if (isOperational) {
    logger.warn(
      { err, requestId: req.id, path: req.path },
      "operational error",
    );
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  // Unknown / programmer error
  logger.error({ err, requestId: req.id, path: req.path }, "unexpected error");
  res
    .status(500)
    .json({ error: { code: "INTERNAL", message: "Internal server error" } });

  // Decide elsewhere whether to crash — see 2.4
}
```

Never leak `err.message` or `err.stack` to clients on 5xx — those messages frequently contain table names, file paths, or SQL fragments.

### 2.3 Catch `unhandledRejection` and `uncaughtException`

```js
// src/server.js (top level)
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "unhandledRejection");
  throw reason; // promote to uncaughtException
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaughtException — exiting");
  // Flush logs, close DB, then exit. Don't try to "recover".
  shutdown(1);
});
```

### 2.4 Crash on programmer errors, don't on operational ones

If a `prisma.user.create` throws `P2002` (unique constraint), translate it to a `ConflictError` and respond. If a `TypeError: Cannot read properties of undefined` escapes, the process is in an unknown state — log, shut down, let the runtime restart you. A zombie process serving 500s is worse than a brief restart.

### 2.5 Translate Prisma errors at the repository boundary

Don't let `PrismaClientKnownRequestError` codes leak into controllers.

```js
// src/components/users/users.repository.js
import { Prisma } from "@prisma/client";
import { prisma } from "../../libraries/prisma.js";
import { ConflictError, NotFoundError } from "../../libraries/errors.js";

export async function createUser(data) {
  try {
    return await prisma.user.create({ data });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") throw new ConflictError("Email already in use");
      if (err.code === "P2025") throw new NotFoundError("User");
    }
    throw err;
  }
}
```

---

## 3. Code Style

### 3.1 Add ESLint + Prettier

You don't have these yet. Add them. Use the flat config (Node 22 + ESM friendly):

```bash
npm i -D eslint @eslint/js eslint-plugin-n eslint-plugin-security eslint-config-prettier prettier
```

```js
// eslint.config.js
import js from "@eslint/js";
import n from "eslint-plugin-n";
import security from "eslint-plugin-security";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  n.configs["flat/recommended"],
  security.configs.recommended,
  prettier,
  {
    languageOptions: { ecmaVersion: 2024, sourceType: "module" },
    rules: {
      "no-throw-literal": "error",
      "no-return-await": "off", // see 3.3
      "require-await": "error",
      "n/no-process-exit": "off", // we use it in shutdown
    },
  },
];
```

### 3.2 Use the `node:` protocol for built-ins

```js
// ❌
import fs from "fs";
import { randomUUID } from "crypto";

// ✅
import fs from "node:fs";
import { randomUUID } from "node:crypto";
```

Makes built-ins unambiguous, avoids accidentally resolving to a malicious npm package named `crypto`.

### 3.3 `return await` inside async functions

Counter-intuitive but matters for stack traces. Without `await`, the current function disappears from the stack trace of any error thrown by the returned promise.

```js
// ❌ stack trace skips this function
async function getUser(id) {
  return userRepo.findById(id);
}

// ✅
async function getUser(id) {
  return await userRepo.findById(id);
}
```

### 3.4 Strict equality, named functions, requires at the top

Standard stuff. `===` always, name your functions (helps in flame graphs and memory snapshots), `import` everything at the top of the file.

---

## 4. Configuration & Secrets

### 4.1 Validate config at boot, fail fast

Don't sprinkle `process.env.X` across the codebase. Load once, validate, export a typed config object. If `DATABASE_URL` is missing, the process should die at boot — not at the first request.

```js
// src/config/index.js
import "dotenv/config";

function required(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

export const config = Object.freeze({
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required("DATABASE_URL"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  logLevel: process.env.LOG_LEVEL ?? "info",
});
```

Consider adopting [`zod`](https://github.com/colinhacks/zod) if the config grows past ~10 vars — it gives you parsing + typing in one pass.

### 4.2 Never commit `.env`. Commit `.env.example`

```
# .gitignore
.env
.env.local
.env.*.local
```

```
# .env.example  (committed)
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
PORT=3000
CORS_ORIGIN=http://localhost:3001
LOG_LEVEL=info
```

### 4.3 Secrets belong in a secret manager in production

`.env` is fine locally. In production, use the platform's secret store (GCP Secret Manager, AWS Secrets Manager, Vercel/Cloud Run env vars, Doppler). Never paste production secrets into a `.env` file on a server.

---

## 5. Express 5 Specifics

Express 5 (May 2025 stable release) changes a few things you should know if you're coming from Express 4:

### 5.1 Async error handling is built-in

Route handlers that throw or reject are caught automatically and forwarded to `next(err)`. **Remove any `express-async-errors` or `asyncHandler` wrappers** — they're no longer needed.

```js
// Express 5 — this works as-is, errors flow to errorHandler
router.get("/users/:id", async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) throw new NotFoundError("User");
  res.json(user);
});
```

### 5.2 Path syntax changed

Express 5 uses `path-to-regexp` v8. Old wildcards break:

- `'*'` → `'/*splat'` or `/(.*)/ ` (named wildcard required)
- `'/users/:id?'` → `'/users{/:id}'` (optional segments use braces)
- Unnamed regex groups are no longer allowed

If a route 404s after upgrade, check this first.

### 5.3 `req.query` is now a plain object (not a parsed `qs` mess)

Set the query parser explicitly so you know what you're getting:

```js
app.set("query parser", "simple"); // or 'extended' for nested objects via qs
```

### 5.4 Set body size limits and disable `x-powered-by`

```js
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
```

Without a limit, anyone can send you a 10 GB JSON payload.

### 5.5 Add `helmet` and request IDs

Two middlewares every Express backend should have:

```bash
npm i helmet
```

```js
import helmet from "helmet";
import { randomUUID } from "node:crypto";

app.use(helmet());
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] ?? randomUUID();
  res.setHeader("x-request-id", req.id);
  next();
});
```

---

## 6. Prisma 7 & Postgres

You're on Prisma 7 with `@prisma/adapter-pg`. A few things worth doing properly.

### 6.1 Single Prisma client instance

Never `new PrismaClient()` per request. One per process. The adapter wraps a `pg` pool — multiple clients = multiple pools = connection exhaustion.

```js
// src/libraries/prisma.js
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config/index.js";

const adapter = new PrismaPg({ connectionString: config.databaseUrl });

export const prisma = new PrismaClient({
  adapter,
  log:
    config.env === "development"
      ? ["query", "warn", "error"]
      : ["warn", "error"],
});
```

### 6.2 Disconnect on shutdown

```js
// in your shutdown handler
await prisma.$disconnect();
```

Without this, connections linger and Postgres eventually rejects new ones.

### 6.3 Use transactions for multi-step writes

If two writes need to be all-or-nothing, wrap them. The interactive transaction API lets you reuse the same `tx` across calls:

```js
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email } });
  await tx.profile.create({ data: { userId: user.id, name } });
  return user;
});
```

### 6.4 Select only what you need

`prisma.user.findMany()` returns every column on every row. Be explicit, especially for list endpoints:

```js
await prisma.user.findMany({
  select: { id: true, email: true, createdAt: true },
  take: 50,
  skip: (page - 1) * 50,
  orderBy: { createdAt: "desc" },
});
```

This also matters for security — `select` is the easiest way to make sure you never accidentally return `passwordHash`.

### 6.5 Always paginate list endpoints

Never return an unbounded list. A `/users` endpoint with no `take` will eventually OOM the process when the table grows.

### 6.6 Avoid N+1 with `include` or `findMany` + map

```js
// ❌ N+1
const jobs = await prisma.job.findMany();
for (const job of jobs) {
  job.employer = await prisma.employer.findUnique({
    where: { id: job.employerId },
  });
}

// ✅ single query
const jobs = await prisma.job.findMany({ include: { employer: true } });
```

### 6.7 Migrations: `migrate dev` locally, `migrate deploy` in CI/prod

Your `db:migrate` script runs `prisma migrate dev` — that's correct for local. **Do not run it in production.** Add a separate prod-safe script:

```json
"db:deploy": "prisma migrate deploy"
```

`migrate dev` can reset the database. `migrate deploy` only applies pending migrations.

### 6.8 You don't need both `pg` and `@prisma/adapter-pg` unless you query raw

Your `package.json` lists both. That's fine — but if you're only using Prisma, `pg` is pulled in transitively by the adapter and you can drop the direct dependency. Keep it explicit only if you have code that uses `pg.Pool` directly somewhere.

---

## 7. Security

### 7.1 Validate every input

Express does no validation. A request body of `{ "email": { "$ne": null } }` will happily flow through to your service layer. Validate at the controller boundary with a schema library:

```bash
npm i zod
```

```js
import { z } from "zod";
import { ValidationError } from "../../libraries/errors.js";

const createUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  role: z.enum(["employer", "student"]),
});

export async function createUserHandler(req, res, next) {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ValidationError("Invalid input", parsed.error.flatten()));
  }
  const user = await userService.createUser(parsed.data);
  res.status(201).json(user);
}
```

### 7.2 Rate-limit auth endpoints

Login, signup, and password reset are brute-force targets. Use `rate-limiter-flexible` (Redis-backed for multi-instance) or `express-rate-limit` (in-memory, fine for one instance):

```bash
npm i express-rate-limit
```

```js
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/auth/login", loginLimiter, loginHandler);
```

### 7.3 Hash passwords with bcrypt or argon2

Never store passwords plaintext, never hash with MD5/SHA-1/SHA-256. Use bcrypt (work factor 12+) or argon2id.

```bash
npm i bcrypt
```

```js
import bcrypt from "bcrypt";
const hash = await bcrypt.hash(password, 12);
const ok = await bcrypt.compare(password, hash);
```

### 7.4 CORS: lock it down

Your `cors()` call currently has no config — that means it allows everything. In production, allow only your frontend origin(s):

```js
app.use(
  cors({
    origin: config.corsOrigin.split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
```

### 7.5 Run `npm audit` and use Dependabot / Snyk

Add to CI:

```bash
npm audit --audit-level=high
```

Enable Dependabot in your repo settings to get PRs for vulnerable transitive dependencies.

### 7.6 Don't log secrets

If you log request bodies for debugging, redact sensitive fields. Pino does this natively:

```js
import pino from "pino";
export const logger = pino({
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "password",
    "*.password",
  ],
});
```

### 7.7 Run as a non-root user in production

In your Cloud Run / Docker container, `USER node` (or any non-root UID). The official Node images already have a `node` user.

---

## 8. Logging & Observability

### 8.1 Replace `console.log` with a real logger

`console.log` is synchronous, has no levels, no structure, and no redaction. Pick `pino` (fast, JSON-native) or `winston` (more features).

```bash
npm i pino pino-http
```

```js
// src/libraries/logger.js
import pino from "pino";
import { config } from "../config/index.js";

export const logger = pino({
  level: config.logLevel,
  redact: ["req.headers.authorization", "req.headers.cookie"],
  ...(config.env === "development" && {
    transport: { target: "pino-pretty", options: { colorize: true } },
  }),
});
```

```js
// src/app.js
import pinoHttp from "pino-http";
import { logger } from "./libraries/logger.js";
app.use(pinoHttp({ logger, customProps: (req) => ({ requestId: req.id }) }));
```

### 8.2 Log to stdout, let the runtime handle it

Don't write to log files from inside the app. Cloud Run, Kubernetes, Vercel, and PM2 all capture stdout/stderr and route it for you. Hard-coding a file path makes the app less portable and harder to operate.

### 8.3 Structured logs, not string concatenation

```js
// ❌
logger.info("User " + userId + " did thing in " + ms + "ms");

// ✅
logger.info({ userId, durationMs: ms }, "user did thing");
```

Queryable in any log aggregator. Greppable in development.

### 8.4 Correlation IDs across the request

Use the `req.id` you set in section 5.5 in every log line for that request. `pino-http` does this automatically once you set `customProps`.

For deeper correlation across async work (queue handlers, background tasks), Node's built-in [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html) carries context through promise chains without threading it as a parameter.

---

## 9. Going to Production

### 9.1 Set `NODE_ENV=production`

In your container / Cloud Run config. Express, Prisma, and many libraries optimize hot paths when this is set.

### 9.2 Use `npm ci`, not `npm install`, in CI and Docker

`npm ci` does a clean install from `package-lock.json` exactly. `npm install` can mutate the lockfile based on `package.json`. CI builds must be deterministic.

```dockerfile
COPY package*.json ./
RUN npm ci --omit=dev
```

### 9.3 Graceful shutdown

When Cloud Run / Kubernetes sends SIGTERM, you have ~10s to drain in-flight requests and close the DB. Otherwise users see 502s.

```js
// src/server.js
import { buildApp } from "./app.js";
import { logger } from "./libraries/logger.js";
import { prisma } from "./libraries/prisma.js";
import { config } from "./config/index.js";

const app = buildApp();
const server = app.listen(config.port, () =>
  logger.info({ port: config.port }, "up"),
);

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

  // Force-exit if graceful shutdown hangs
  setTimeout(() => {
    logger.error("forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));
```

### 9.4 Health check endpoint

Cloud Run and load balancers need this. Make it cheap — don't query the DB on every probe unless you have a "deep" check on a separate path.

```js
app.get("/healthz", (req, res) => res.json({ status: "ok" }));
app.get("/readyz", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "not ready" });
  }
});
```

### 9.5 Pin your Node version

Add to `package.json`:

```json
"engines": {
  "node": ">=22.0.0"
}
```

And use `.nvmrc` or `volta` so every developer and CI runner uses the same version:

```
# .nvmrc
22
```

### 9.6 Use an LTS Node version

Node 22 is current LTS as of 2025. Node 24 hits LTS in October 2025. Don't run odd-numbered (non-LTS) versions in production.

### 9.7 Run behind a reverse proxy for TLS, gzip, and static files

Cloud Run handles this for you. If you self-host: nginx or Caddy in front. Don't terminate TLS in Node — it's slow and you don't need the complexity.

If running behind a proxy, tell Express:

```js
app.set("trust proxy", 1);
```

So `req.ip` reflects the real client, not the proxy.

### 9.8 Use all CPU cores

Single Node process = 1 core. Options:

- **Cloud Run / Kubernetes:** scale instances horizontally. Don't cluster inside a container.
- **Bare VM:** run the [`cluster`](https://nodejs.org/api/cluster.html) module or [PM2](https://pm2.keymetrics.io/) in cluster mode.

### 9.9 Lock your lockfile

`package-lock.json` must be committed. Verify it in CI:

```bash
npm ci   # will fail if lockfile and package.json disagree
```

---

## 10. Testing

You don't have tests yet (no test framework in `devDependencies`). Worth adding — even a thin API test layer catches more than unit tests for the effort.

### 10.1 Node's built-in test runner is sufficient

No Jest needed for a backend this size:

```js
// users.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";

test("GET /healthz returns ok", async () => {
  const app = buildApp();
  const server = app.listen(0); // random port
  const { port } = server.address();
  const res = await fetch(`http://localhost:${port}/healthz`);
  assert.equal(res.status, 200);
  server.close();
});
```

Run with `node --test`.

### 10.2 AAA naming + structure

Every test name: `<unit> > <scenario> > <expected>`. E.g. `createUser > when email is already taken > responds 409`.

Every test body: **Arrange** (setup) → **Act** (call the thing) → **Assert** (check).

### 10.3 Use a real Postgres in tests, not mocks

Mocking Prisma is a trap — you end up testing your mocks. Use [Testcontainers](https://node.testcontainers.org/) or a dedicated test database with truncation between tests. Reads are cheap, writes are where bugs hide.

### 10.4 Test the five outcomes

For any action, assert:

1. The HTTP response
2. The DB state change
3. Any outgoing API calls (mock with `nock`)
4. Any queue messages
5. Critical log/metric emissions

Most bugs hide in 2–5, not in 1.

---

## 11. Recommended Additions to `package.json`

A concrete list of things to add, given the current state:

```json
{
  "engines": { "node": ">=22.0.0" },
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "test": "node --test --test-reporter=spec",
    "test:watch": "node --test --watch",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "audit": "npm audit --audit-level=high"
  },
  "dependencies": {
    "helmet": "^8.0.0",
    "pino": "^9.0.0",
    "pino-http": "^10.0.0",
    "zod": "^3.23.0",
    "bcrypt": "^5.1.0",
    "express-rate-limit": "^7.0.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "@eslint/js": "^9.0.0",
    "eslint-plugin-n": "^17.0.0",
    "eslint-plugin-security": "^3.0.0",
    "eslint-config-prettier": "^9.0.0",
    "prettier": "^3.0.0",
    "pino-pretty": "^11.0.0"
  }
}
```

A couple of notes on what I changed and _didn't_ change:

- **Dropped `nodemon`** in favour of `node --watch` (built in since Node 18, no extra dep).
- **Kept `dotenv`** — it's fine, but you could also use `node --env-file=.env` and drop it.
- **Did not add a testing framework** — Node's built-in `node:test` is enough until you have ~50+ tests and want fancier reporters.
- **Did not add TypeScript** — your current package is pure JS. Adding TS is a bigger conversation; if you do, do it incrementally with JSDoc + `checkJs` first.

---

## Priority Order if You Only Have a Day

If this looks like a lot, here's the order I'd tackle it in:

1. **Central error handler + `AppError` classes** (section 2) — biggest payoff for least effort
2. **Config validation + secrets out of code** (section 4)
3. **Helmet + body limit + CORS lockdown + rate limit on auth** (sections 5.4, 5.5, 7.2, 7.4)
4. **Pino logger + request IDs** (section 8)
5. **Graceful shutdown + health checks** (sections 9.3, 9.4)
6. **Zod validation on every endpoint** (section 7.1)
7. **ESLint + Prettier** (section 3.1)
8. **Restructure into components** (section 1) — last, because it's the most invasive

Everything else is incremental.
