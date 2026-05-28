import { prisma } from '../../libraries/prisma.js';

export const upsertToken = (userId, token, platform) =>
  prisma.pushToken.upsert({
    where: { token },
    update: { userId, platform, updatedAt: new Date() },
    create: { userId, token, platform },
  });

export const getTokensForUsers = (userIds) =>
  prisma.pushToken.findMany({
    where: { userId: { in: userIds } },
    select: { token: true },
  });
