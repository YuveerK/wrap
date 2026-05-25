import { Prisma } from "@prisma/client";
import { prisma } from "../../libraries/prisma.js";
import { ConflictError, NotFoundError } from "../../libraries/errors.js";

export async function findAllUsers(select, pagination) {
  return await prisma.user.findMany({ select, ...pagination });
}

export async function findUserById(id) {
  return await prisma.user.findUnique({ where: { id } });
}

export async function createUser(data) {
  try {
    return await prisma.user.create({ data });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") throw new ConflictError("Email already in use");
    }
    throw err;
  }
}

export async function updateUser(id, data) {
  try {
    return await prisma.user.update({ where: { id }, data });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") throw new NotFoundError("User");
    }
    throw err;
  }
}

export async function deleteUser(id) {
  try {
    await prisma.user.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") throw new NotFoundError("User");
    }
    throw err;
  }
}
