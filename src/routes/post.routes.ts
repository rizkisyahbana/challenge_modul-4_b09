import { Router } from "express";
import {
  createBulkPosts,
  createPost,
  getAllPosts,
  getDailyPostStats,
  getPostById,
} from "../controllers/postController";

const router = Router();

router.post("/", createPost);
router.post("/bulk", createBulkPosts);
router.get("/", getAllPosts);
router.get("/stats/daily", getDailyPostStats); // Wajib di atas /:id
router.get("/:id", getPostById);

export default router;
