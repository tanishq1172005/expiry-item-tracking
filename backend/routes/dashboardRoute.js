import { Router } from "express";
import { getExpiring,getStats } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router()

router.get('/stats',authMiddleware,getStats)
router.get('/expiring',authMiddleware,getExpiring)

export default router