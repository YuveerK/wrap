import * as usersService from "./users.service.js";

export async function getUsers(req, res) {
  const users = await usersService.getUsers();
  res.json(users);
}

export async function getUserById(req, res) {
  const user = await usersService.getUserById(Number(req.params.id));
  res.json(user);
}

export async function createUser(req, res) {
  const { email, name } = req.body;
  const user = await usersService.createUser({ email, name });
  res.status(201).json(user);
}

export async function updateUser(req, res) {
  const { email, name } = req.body;
  const user = await usersService.updateUser(Number(req.params.id), { email, name });
  res.json(user);
}

export async function deleteUser(req, res) {
  await usersService.deleteUser(Number(req.params.id));
  res.status(204).send();
}
