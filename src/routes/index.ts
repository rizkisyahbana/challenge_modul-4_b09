import { Router } from "express";
import postRouter from "./post.routes";
import userRouter from "./user.routes";

const router = Router();

router.use("/users", userRouter);
router.use("/posts", postRouter);

export default router;