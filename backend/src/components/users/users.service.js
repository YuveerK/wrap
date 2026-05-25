import * as usersRepo from "./users.repository.js";
import { NotFoundError } from "../../libraries/errors.js";

export async function getUsers() {
  return await usersRepo.findAllUsers(
    { id: true, email: true, name: true, createdAt: true },
    { take: 50, orderBy: { createdAt: "desc" } },
  );
}

export async function getUserById(id) {
  const user = await usersRepo.findUserById(id);
  if (!user) throw new NotFoundError("User");
  return user;
}

export async function createUser(data) {
  return await usersRepo.createUser(data);
}

export async function updateUser(id, data) {
  return await usersRepo.updateUser(id, data);
}

export async function deleteUser(id) {
  await usersRepo.deleteUser(id);
}
