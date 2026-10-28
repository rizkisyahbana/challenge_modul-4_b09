import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error";

const fail = (
  res: Response,
  status: number,
  message: string,
  errors?: unknown[],
): void => {
  res.status(status).json({ status: false, message, ...(errors ? { errors } : {}) });
};

export const notFound = (req: Request, res: Response): void => {
  fail(res, 404, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`);
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof HttpError) {
    fail(res, err.status, err.message, err.errors);
    return;
  }

  if (typeof err === "object" && err !== null && "code" in err) {
    if (err.code === "P2002") return fail(res, 409, "Data sudah ada (nilai unik bentrok)");
    if (err.code === "P2025") return fail(res, 404, "Data tidak ditemukan");
    if (err.code === "P2003") return fail(res, 400, "Relasi data tidak valid");
  }

  console.error(err);
  fail(res, 500, "Terjadi kesalahan pada server");
};