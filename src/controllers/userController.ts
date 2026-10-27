import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { HttpError } from "../utils/http-error";
import { parseId } from "../utils/parse";
import { sendSuccess } from "../utils/response";

export const createUser = async (req: Request, res: Response) => {
  const { email, name, password } = req.body ?? {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !password) {
    throw new HttpError(400, "Email dan password wajib diisi");
  }

  // Validasi Format Email (Challenge 6)
  if (!emailRegex.test(email)) {
    throw new HttpError(400, "Format email tidak valid");
  }

  // Validasi Panjang Password (Challenge 6)
  if (password.length < 8) {
    throw new HttpError(400, "Password minimal 8 karakter");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new HttpError(409, "Email sudah terdaftar");
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: await bcrypt.hash(password, 10),
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  sendSuccess(res, 201, "User berhasil dibuat", user);
};

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
  });
  sendSuccess(res, 200, "Berhasil mengambil data users", users);
};

export const getUserById = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!user) throw new HttpError(404, "User tidak ditemukan");
  sendSuccess(res, 200, "Berhasil mengambil data user", user);
};