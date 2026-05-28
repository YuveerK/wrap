import { prisma } from "../../libraries/prisma.js";
import { SAFE_USER_SELECT } from "../auth/auth.repository.js";

const attachmentSelect = {
  id: true,
  originalName: true,
  storedName: true,
  mimeType: true,
  sizeBytes: true,
  urlPath: true,
  createdAt: true,
};

export async function findPosts(userId, pinnedFirst = true) {
  const orderBy = pinnedFirst
    ? [{ pinned: "desc" }, { createdAt: "desc" }]
    : [{ createdAt: "desc" }];

  return await prisma.post.findMany({
    select: {
      id: true,
      category: true,
      title: true,
      body: true,
      pinned: true,
      bannerPath: true,
      likeCount: true,
      commentCount: true,
      addressText: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
      author: { select: SAFE_USER_SELECT },
      likes: {
        where: { userId },
        select: { userId: true },
      },
      _count: { select: { attachments: true } },
    },
    orderBy,
    take: 100,
  });
}

export async function findPostById(id) {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: SAFE_USER_SELECT },
      attachments: { select: attachmentSelect, orderBy: { createdAt: "asc" } },
      likes: { select: { userId: true } },
    },
  });
}

export async function findPostLikedByUser(postId, userId) {
  return await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });
}

export async function createPost(data) {
  return await prisma.post.create({
    data,
    include: {
      author: { select: SAFE_USER_SELECT },
      attachments: { select: attachmentSelect },
      likes: { select: { userId: true } },
    },
  });
}

export async function addPostLike(postId, userId) {
  return await prisma.postLike.create({
    data: { postId, userId },
  });
}

export async function removePostLike(postId, userId) {
  return await prisma.postLike.delete({
    where: { postId_userId: { postId, userId } },
  });
}

export async function incrementLikeCount(postId, delta) {
  return await prisma.post.update({
    where: { id: postId },
    data: { likeCount: { increment: delta } },
    select: { likeCount: true },
  });
}

export async function findCommentById(id) {
  return await prisma.postComment.findUnique({
    where: { id },
    select: { id: true, postId: true, parentId: true, authorId: true },
  });
}

export async function findTopLevelComments(postId) {
  return await prisma.postComment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: SAFE_USER_SELECT },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: SAFE_USER_SELECT } },
      },
    },
  });
}

export async function createComment(data) {
  return await prisma.postComment.create({
    data,
    include: { author: { select: SAFE_USER_SELECT } },
  });
}

export async function incrementCommentCount(postId) {
  return await prisma.post.update({
    where: { id: postId },
    data: { commentCount: { increment: 1 } },
    select: { commentCount: true },
  });
}
