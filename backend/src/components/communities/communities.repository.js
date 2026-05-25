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
