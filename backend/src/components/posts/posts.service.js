import * as postsRepo from "./posts.repository.js";
import * as communitiesRepo from "../communities/communities.repository.js";
import { AppError } from "../../libraries/errors.js";

export async function listPosts(userId, { pinnedFirst = true } = {}) {
  const communityId = await communitiesRepo.getUserCommunityId(userId);
  if (!communityId) {
    throw new AppError("Join a community before viewing posts", { status: 403, code: "NO_COMMUNITY" });
  }
  return await postsRepo.findPosts(communityId, pinnedFirst);
}

export async function createPost(userId, role, input) {
  const communityId = await communitiesRepo.getUserCommunityId(userId);
  if (!communityId) {
    throw new AppError("Join a community before posting", { status: 403, code: "NO_COMMUNITY" });
  }

  const canPin = role === "COMMITTEE" || role === "ADMIN";
  const pinned = canPin && input.pinned === true;

  return await postsRepo.createPost({
    communityId,
    authorId: userId,
    title: input.title ?? null,
    body: input.body,
    pinned,
  });
}
