import path from "node:path";
import * as postsRepo from "./posts.repository.js";
import { buildPublicMediaUrl } from "../../libraries/media-url.js";
import { moveToPublic } from "../../multer/utils/move-to-public.js";
import { cleanupTempFiles } from "../../multer/utils/cleanup-temp-file.js";
import { validateFileExtension } from "../../multer/validators/validate-file-extension.js";
import { AppError, NotFoundError } from "../../libraries/errors.js";
import { isAllowedSuburb } from "../../libraries/suburbs.js";
import { sendPushNotifications } from "../notifications/notifications.service.js";

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".pdf",
];

function formatAttachment(att) {
  return {
    id: att.id,
    originalName: att.originalName,
    mimeType: att.mimeType,
    sizeBytes: att.sizeBytes,
    url: buildPublicMediaUrl(att.urlPath),
    createdAt: att.createdAt,
  };
}

function formatPostSummary(post, userId) {
  return {
    id: post.id,
    category: post.category,
    title: post.title,
    body: post.body,
    pinned: post.pinned,
    bannerUrl: buildPublicMediaUrl(post.bannerPath),
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    attachmentCount: post._count?.attachments ?? post.attachments?.length ?? 0,
    likedByMe: post.likes?.some((l) => l.userId === userId) ?? false,
    addressText: post.addressText ?? null,
    latitude: post.latitude ?? null,
    longitude: post.longitude ?? null,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
  };
}

function formatPostDetail(post, userId, comments) {
  return {
    ...formatPostSummary(
      {
        ...post,
        _count: { attachments: post.attachments?.length ?? 0 },
        likes: post.likes?.filter((l) => l.userId === userId) ?? [],
      },
      userId,
    ),
    attachments: (post.attachments ?? []).map(formatAttachment),
    comments,
  };
}

function collectUploadedFiles(req) {
  /** @type {import('multer').File[]} */
  const files = [];
  const grouped = req.files;
  if (!grouped || Array.isArray(grouped)) return files;
  if (grouped.banner?.[0]) files.push(grouped.banner[0]);
  if (grouped.attachments?.length) files.push(...grouped.attachments);
  return files;
}

async function processUploadedFiles(files) {
  let bannerPath = null;
  /** @type {Array<{ originalName: string, storedName: string, mimeType: string, sizeBytes: number, urlPath: string }>} */
  const attachments = [];

  for (const file of files) {
    if (!validateFileExtension(file.originalname, ALLOWED_EXTENSIONS)) {
      throw new AppError("Unsupported file type", {
        status: 400,
        code: "UPLOAD_UNSUPPORTED_TYPE",
      });
    }

    const urlPath = await moveToPublic(file.path, "posts");
    const meta = {
      originalName: file.originalname,
      storedName: path.basename(urlPath),
      mimeType: file.mimetype,
      sizeBytes: file.size,
      urlPath,
    };

    if (file.fieldname === "banner") {
      bannerPath = urlPath;
    } else {
      attachments.push(meta);
    }
  }

  return { bannerPath, attachments };
}

export async function listPosts(userId, { pinnedFirst = true } = {}) {
  const posts = await postsRepo.findPosts(userId, pinnedFirst);
  return posts.map((p) => formatPostSummary(p, userId));
}

export async function getPostById(userId, postId) {
  const post = await postsRepo.findPostById(postId);
  if (!post) throw new NotFoundError("Post");

  const comments = await postsRepo.findTopLevelComments(postId);
  return formatPostDetail(post, userId, comments);
}

export async function createPost(userId, role, input, req) {
  const uploaded = collectUploadedFiles(req);
  let bannerPath = null;
  let attachmentRows = [];

  try {
    if (uploaded.length) {
      const processed = await processUploadedFiles(uploaded);
      bannerPath = processed.bannerPath;
      attachmentRows = processed.attachments;
    }

    if (input.suburb && !isAllowedSuburb(input.suburb)) {
      throw new AppError(`${input.suburb} is outside the WJRA service area.`, {
        status: 422,
        code: "SUBURB_NOT_ALLOWED",
      });
    }

    const canPin = role === "COMMITTEE" || role === "ADMIN";
    const pinned = canPin && input.pinned === true;

    const post = await postsRepo.createPost({
      authorId: userId,
      category: input.category ?? "NOTICES",
      title: input.title ?? null,
      body: input.body,
      pinned,
      bannerPath,
      addressText: input.addressText ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      attachments: attachmentRows.length
        ? { create: attachmentRows }
        : undefined,
    });

    return formatPostDetail({ ...post, likes: [] }, userId, []);
  } catch (err) {
    await cleanupTempFiles(uploaded);
    throw err;
  }
}

export async function toggleLike(userId, postId) {
  const post = await postsRepo.findPostById(postId);
  if (!post) throw new NotFoundError("Post");

  const existing = await postsRepo.findPostLikedByUser(postId, userId);

  if (existing) {
    await postsRepo.removePostLike(postId, userId);
    await postsRepo.incrementLikeCount(postId, -1);
    const updated = await postsRepo.findPostById(postId);
    return { liked: false, likeCount: Math.max(0, updated.likeCount) };
  }

  await postsRepo.addPostLike(postId, userId);
  await postsRepo.incrementLikeCount(postId, 1);
  const updated = await postsRepo.findPostById(postId);
  return { liked: true, likeCount: updated.likeCount };
}

export async function addComment(userId, postId, { body, parentId }) {
  const post = await postsRepo.findPostById(postId);
  if (!post) throw new NotFoundError("Post");

  let parentComment = null;
  if (parentId) {
    parentComment = await postsRepo.findCommentById(parentId);
    if (!parentComment || parentComment.postId !== postId) {
      throw new NotFoundError("Comment");
    }
  }

  const comment = await postsRepo.createComment({
    postId,
    authorId: userId,
    parentId: parentId ?? null,
    body,
  });

  await postsRepo.incrementCommentCount(postId);

  // Fire-and-forget: notify post author and/or parent comment author
  const authorName = [comment.author?.firstName, comment.author?.lastName]
    .filter(Boolean)
    .join(" ") || "Someone";

  const recipientIds = new Set();
  if (post.author.id !== userId) recipientIds.add(post.author.id);
  if (parentComment && parentComment.authorId !== userId) {
    recipientIds.add(parentComment.authorId);
  }

  if (recipientIds.size > 0) {
    sendPushNotifications([...recipientIds], {
      title: "New reply on Wrap",
      body: `${authorName} commented on your post`,
      data: { screen: "PostDetail", id: postId },
    }).catch(() => {});
  }

  return comment;
}
