import * as postsService from "./posts.service.js";
import { createPostBodySchema, createCommentSchema } from "./posts.schemas.js";
import { ValidationError } from "../../libraries/errors.js";

export async function listPosts(req, res, next) {
  try {
    const posts = await postsService.listPosts(req.user.sub, req.validatedQuery);
    res.json({ posts });
  } catch (err) {
    next(err);
  }
}

export async function getPost(req, res, next) {
  try {
    const post = await postsService.getPostById(req.user.sub, Number(req.params.id));
    res.json({ post });
  } catch (err) {
    next(err);
  }
}

export async function createPost(req, res, next) {
  try {
    const parsed = createPostBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError("Invalid request data", parsed.error.flatten()));
    }

    const post = await postsService.createPost(
      req.user.sub,
      req.user.role,
      {
        title: parsed.data.title?.trim() || undefined,
        body: parsed.data.body.trim(),
        pinned: parsed.data.pinned,
        category: parsed.data.category,
        addressText: parsed.data.addressText?.trim() || undefined,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        suburb: parsed.data.suburb?.trim() || undefined,
      },
      req,
    );
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
}

export async function toggleLike(req, res, next) {
  try {
    const result = await postsService.toggleLike(req.user.sub, Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function addComment(req, res, next) {
  try {
    const comment = await postsService.addComment(
      req.user.sub,
      Number(req.params.id),
      req.body,
    );
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
}
