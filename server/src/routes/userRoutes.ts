import { Router } from "express";
import { getCurrentUser, listDemoUsers } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/me", requireAuth, getCurrentUser);
router.get("/demo", listDemoUsers);

export default router;
