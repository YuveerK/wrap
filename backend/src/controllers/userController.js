import prisma from "../lib/prisma.js";

export async function getUsers(req, res) {
  const users = await prisma.user.findMany();
  res.json(users);
}

export async function getUserById(req, res) {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}

export async function createUser(req, res) {
  const { email, name } = req.body;
  const user = await prisma.user.create({ data: { email, name } });
  res.status(201).json(user);
}

export async function updateUser(req, res) {
  const { id } = req.params;
  const { email, name } = req.body;
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { email, name },
  });
  res.json(user);
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  await prisma.user.delete({ where: { id: Number(id) } });
  res.status(204).send();
}
