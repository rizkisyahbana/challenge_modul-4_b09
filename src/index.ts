import "dotenv/config";
import express from "express";
import prisma from "./config/prisma";
import { errorHandler, notFound } from "./middlewares/error";
import router from "./routes";

const app = express();

app.use(express.json());

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: true, message: "Server dan database OK" });
});

app.use("/api", router);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, (error?: Error) => {
  if (error) throw error;
  console.log(`Server berjalan di http://localhost:${PORT}`);
});