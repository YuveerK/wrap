import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as postsController from "./posts.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { createCommentSchema, listPostsQuerySchema } from "./posts.schemas.js";
import { uploadPostMedia } from "../../multer/multer.middleware.js";

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { code: "RATE_LIMITED", message: "Too many requests, please try again later." },
  },
});

const router = Router();

router.use(authenticate);

router.get("/", validateQuery(listPostsQuerySchema), postsController.listPosts);
router.get("/:id", postsController.getPost);
router.post(
  "/",
  writeLimiter,
  uploadPostMedia,
  postsController.createPost,
);
router.post("/:id/like", writeLimiter, postsController.toggleLike);
router.post(
  "/:id/comments",
  writeLimiter,
  validateBody(createCommentSchema),
  postsController.addComment,
);

export default router;
