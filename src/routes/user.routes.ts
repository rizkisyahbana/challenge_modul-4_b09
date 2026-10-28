import { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  getUserPosts,
} from "../controllers/userController";

const router = Router();

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id/posts", getUserPosts);
router.get("/:id", getUserById);

export default router;
