import { prisma } from "../../libraries/prisma.js";
import { SAFE_USER_SELECT } from "../auth/auth.repository.js";

const postSelect = {
  id: true,
  title: true,
  body: true,
  pinned: true,
  createdAt: true,
  updatedAt: true,
  author: { select: SAFE_USER_SELECT },
};

export async function findPosts(communityId, pinnedFirst = true) {
  const orderBy = pinnedFirst
    ? [{ pinned: "desc" }, { createdAt: "desc" }]
    : [{ createdAt: "desc" }];

  return await prisma.post.findMany({
    where: { communityId },
    select: postSelect,
    orderBy,
    take: 100,
  });
}

export async function createPost(data) {
  return await prisma.post.create({
    data,
    select: postSelect,
  });
}
