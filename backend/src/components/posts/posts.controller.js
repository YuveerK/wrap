import * as postsService from "./posts.service.js";

export async function listPosts(req, res, next) {
  try {
    const posts = await postsService.listPosts(req.user.sub, req.validatedQuery);
    res.json({ posts });
  } catch (err) {
    next(err);
  }
}

export async function createPost(req, res, next) {
  try {
    const post = await postsService.createPost(req.user.sub, req.user.role, req.body);
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
}
