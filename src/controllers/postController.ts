import type { Request, Response } from "express";
import prisma from "../config/prisma";
import { HttpError } from "../utils/http-error";
import { parseId } from "../utils/parse";
import { sendSuccess } from "../utils/response";

export const createPost = async (req: Request, res: Response) => {
  const { title, content, authorId } = req.body ?? {};
  if (!title || !authorId) throw new HttpError(400, "Title dan authorId wajib diisi");

  const author = await prisma.user.findUnique({ where: { id: parseId(authorId) } });
  if (!author) throw new HttpError(404, "User tidak ditemukan");

  const post = await prisma.post.create({
    data: { title, content, authorId: author.id },
  });

  sendSuccess(res, 201, "Post berhasil dibuat", post);
};

export const getAllPosts = async (_req: Request, res: Response) => {
  const posts = await prisma.post.findMany();
  sendSuccess(res, 200, "Berhasil mengambil data posts", posts);
};

// Challenge 3: Statistik Harian menggunakan date_trunc
export const getDailyPostStats = async (_req: Request, res: Response) => {
  const daily = await prisma.$queryRaw<{ day: Date; total: number }[]>`
    SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS total
    FROM "Post"
    GROUP BY day
    ORDER BY day
  `;

  sendSuccess(res, 200, "Berhasil mengambil statistik posts per hari", {
    daily,
  });
};

export const getPostById = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new HttpError(404, "Post tidak ditemukan");
  sendSuccess(res, 200, "Berhasil mengambil data post", post);
};

export const createBulkPosts = async (req: Request, res: Response) => {
  if (!Array.isArray(req.body) || req.body.length === 0) {
    throw new HttpError(400, "Body harus berupa array post dan tidak boleh kosong");
  }

  const postsData: {
    title: string;
    content: string | null;
    published: boolean;
    authorId: number;
  }[] = [];

  for (let i = 0; i < req.body.length; i++) {
    const item = req.body[i];
    const itemNum = i + 1;

    if (!item || typeof item !== "object" || typeof item.title !== "string" || !item.title.trim()) {
      throw new HttpError(400, `Item ke-${itemNum}: title wajib diisi`);
    }

    if (item.authorId === undefined || item.authorId === null || item.authorId === "") {
      throw new HttpError(400, `Item ke-${itemNum}: authorId wajib diisi`);
    }

    const authorId = parseId(item.authorId);

    postsData.push({
      title: item.title,
      content: typeof item.content === "string" ? item.content : null,
      published: typeof item.published === "boolean" ? item.published : false,
      authorId,
    });
  }

  const uniqueAuthorIds = Array.from(new Set(postsData.map((p) => p.authorId)));

  const existingUsers = await prisma.user.findMany({
    where: {
      id: { in: uniqueAuthorIds },
    },
    select: { id: true },
  });

  if (existingUsers.length !== uniqueAuthorIds.length) {
    throw new HttpError(404, "Ada authorId yang tidak ditemukan");
  }

  const result = await prisma.post.createMany({
    data: postsData,
  });

  sendSuccess(res, 201, `${result.count} post berhasil dibuat`, {
    count: result.count,
  });
};
