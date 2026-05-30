import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as issuesController from "./issues.controller.js";
import { authenticate, authorize } from "../../middleware/authenticate.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import {
  createIssueSchema,
  createIssueUpdateSchema,
  listIssuesQuerySchema,
  updateIssueStatusSchema,
} from "./issues.schemas.js";

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many requests, please try again later." } },
});

const router = Router();

router.use(authenticate);

router.get("/", validateQuery(listIssuesQuerySchema), issuesController.listIssues);
router.get("/:id", issuesController.getIssue);
router.post("/", writeLimiter, validateBody(createIssueSchema), issuesController.createIssue);
router.post("/:id/support", writeLimiter, issuesController.supportIssue);
router.post("/:id/watch", writeLimiter, issuesController.watchIssue);
router.delete("/:id/watch", writeLimiter, issuesController.unwatchIssue);
router.post(
  "/:id/updates",
  writeLimiter,
  authorize("COMMITTEE", "ADMIN"),
  validateBody(createIssueUpdateSchema),
  issuesController.addIssueUpdate,
);
router.patch(
  "/:id/status",
  writeLimiter,
  authorize("COMMITTEE", "ADMIN"),
  validateBody(updateIssueStatusSchema),
  issuesController.updateIssueStatus,
);
router.patch(
  "/:id/reporter-status",
  writeLimiter,
  validateBody(updateIssueStatusSchema),
  issuesController.reporterUpdateStatus,
);

export default router;
