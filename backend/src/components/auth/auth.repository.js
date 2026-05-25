import { createHash } from "node:crypto";
import { prisma } from "../../libraries/prisma.js";

export const SAFE_USER_SELECT = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  streetAddress: true,
  postalCode: true,
  profilePhoto: true,
  role: true,
  isVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export async function findUserById(id) {
  return await prisma.user.findUnique({
    where: { id },
    select: SAFE_USER_SELECT,
  });
}

export async function findUserByEmail(email) {
  return await prisma.user.findUnique({ where: { email } });
}

export async function findUserByVerifyToken(token) {
  const tokenHash = hashToken(token);
  return await prisma.user.findFirst({
    where: {
      verifyToken: tokenHash,
      verifyTokenExpiry: { gt: new Date() },
    },
  });
}

export async function findUserByResetToken(token) {
  const tokenHash = hashToken(token);
  return await prisma.user.findFirst({
    where: {
      resetToken: tokenHash,
      resetTokenExpiry: { gt: new Date() },
    },
  });
}

export async function createUser(data) {
  return await prisma.user.create({ data });
}

export async function updateUser(id, data) {
  return await prisma.user.update({ where: { id }, data });
}

export async function saveRefreshToken(userId, token, expiresAt) {
  const tokenHash = hashToken(token);
  return await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });
}

export async function findRefreshToken(token) {
  const tokenHash = hashToken(token);
  return await prisma.refreshToken.findUnique({ where: { tokenHash } });
}

export async function deleteRefreshToken(token) {
  const tokenHash = hashToken(token);
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
}

export async function deleteAllUserRefreshTokens(userId) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
