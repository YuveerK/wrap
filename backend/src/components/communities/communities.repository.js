import { prisma } from "../../libraries/prisma.js";

export async function findCommunityById(id) {
  return await prisma.community.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true, issues: true, posts: true } },
    },
  });
}

export async function findDefaultCommunity() {
  return await prisma.community.findFirst({ orderBy: { id: "asc" } });
}

export async function getUserCommunityId(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { communityId: true },
  });
  return user?.communityId ?? null;
}

export const DEFAULT_COMMUNITY_ID = 1;

/** Returns the user's communityId, auto-assigning to the default community if unset. */
export async function resolveUserCommunityId(userId) {
  const id = await getUserCommunityId(userId);
  if (id) return id;
  await assignUserToCommunity(userId, DEFAULT_COMMUNITY_ID);
  return DEFAULT_COMMUNITY_ID;
}

export async function assignUserToCommunity(userId, communityId) {
  return await prisma.user.update({
    where: { id: userId },
    data: { communityId },
    select: { communityId: true },
  });
}

export async function countMembers(communityId) {
  return await prisma.user.count({ where: { communityId } });
}
