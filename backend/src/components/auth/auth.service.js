import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import * as authRepo from "./auth.repository.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../libraries/jwt.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../libraries/mailer.js";
import { AppError, ConflictError, NotFoundError } from "../../libraries/errors.js";

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export async function register(data) {
  const existing = await authRepo.findUserByEmail(data.email);
  if (existing) throw new ConflictError("An account with this email already exists");

  const passwordHash = await bcrypt.hash(data.password, 12);
  const verifyToken = randomBytes(32).toString("hex");
  const verifyTokenHash = createHash("sha256").update(verifyToken).digest("hex");
  const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    await authRepo.createUser({
      ...data,
      password: passwordHash,
      verifyToken: verifyTokenHash,
      verifyTokenExpiry,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("An account with this phone number already exists");
    }
    throw err;
  }

  await sendVerificationEmail(data.email, verifyToken);
}

export async function verifyEmail(token) {
  const user = await authRepo.findUserByVerifyToken(token);
  if (!user) throw new AppError("Invalid or expired verification link", { status: 400, code: "INVALID_TOKEN" });

  await authRepo.updateUser(user.id, {
    isVerified: true,
    verifyToken: null,
    verifyTokenExpiry: null,
  });
}

export async function login(email, password) {
  const user = await authRepo.findUserByEmail(email);
  if (!user) throw new AppError("Invalid email or password", { status: 401, code: "INVALID_CREDENTIALS" });

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw new AppError("Invalid email or password", { status: 401, code: "INVALID_CREDENTIALS" });

  if (!user.isVerified) throw new AppError("Please verify your email before logging in", { status: 403, code: "EMAIL_NOT_VERIFIED" });
  if (!user.isActive) throw new AppError("Your account has been deactivated", { status: 403, code: "ACCOUNT_INACTIVE" });

  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
  await authRepo.saveRefreshToken(user.id, refreshToken, expiresAt);

  const safeUser = await authRepo.findUserById(user.id);
  return { accessToken, refreshToken, user: safeUser };
}

export async function getMe(userId) {
  const user = await authRepo.findUserById(userId);
  if (!user) throw new NotFoundError("User");
  if (!user.isActive) throw new AppError("Your account has been deactivated", { status: 403, code: "ACCOUNT_INACTIVE" });
  return user;
}

export async function refresh(token) {
  if (!token) throw new AppError("No refresh token", { status: 401, code: "MISSING_TOKEN" });

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError("Invalid or expired refresh token", { status: 401, code: "INVALID_TOKEN" });
  }

  const stored = await authRepo.findRefreshToken(token);
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError("Refresh token revoked or expired", { status: 401, code: "INVALID_TOKEN" });
  }

  await authRepo.deleteRefreshToken(token);
  const newRefreshToken = signRefreshToken({ sub: payload.sub, role: payload.role });
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
  await authRepo.saveRefreshToken(payload.sub, newRefreshToken, expiresAt);

  const accessToken = signAccessToken({ sub: payload.sub, role: payload.role });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(token) {
  if (token) await authRepo.deleteRefreshToken(token);
}

export async function forgotPassword(email) {
  const user = await authRepo.findUserByEmail(email);
  if (!user) return;

  const resetToken = randomBytes(32).toString("hex");
  const resetTokenHash = createHash("sha256").update(resetToken).digest("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  await authRepo.updateUser(user.id, { resetToken: resetTokenHash, resetTokenExpiry });
  await sendPasswordResetEmail(user.email, resetToken);
}

export async function resetPassword(token, newPassword) {
  const user = await authRepo.findUserByResetToken(token);
  if (!user) throw new AppError("Invalid or expired reset link", { status: 400, code: "INVALID_TOKEN" });

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await authRepo.updateUser(user.id, {
    password: passwordHash,
    resetToken: null,
    resetTokenExpiry: null,
  });

  await authRepo.deleteAllUserRefreshTokens(user.id);
}
