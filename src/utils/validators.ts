import { HttpError, type FieldError } from "./http-error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCreateUser = (body: unknown) => {
  const { email, name, password } = (body ?? {}) as Record<string, unknown>;
  const errors: FieldError[] = [];

  if (typeof email !== "string" || email.trim() === "") {
    errors.push({ field: "email", message: "Email wajib diisi" });
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: "email", message: "Format email tidak valid" });
  }

  if (typeof password !== "string" || password === "") {
    errors.push({ field: "password", message: "Password wajib diisi" });
  } else {
    if (password.length < 8) {
      errors.push({ field: "password", message: "Password minimal 8 karakter" });
    }
    if (password.length > 72) {
      errors.push({ field: "password", message: "Password maksimal 72 karakter" });
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      errors.push({
        field: "password",
        message: "Password harus mengandung huruf dan angka",
      });
    }
  }

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    errors.push({ field: "name", message: "Nama minimal 2 karakter" });
  }

  if (errors.length > 0) {
    throw new HttpError(400, "Validasi gagal", errors);
  }

  return {
    email: (email as string).trim().toLowerCase(),
    name: name === undefined ? undefined : (name as string).trim(),
    password: password as string,
  };
};