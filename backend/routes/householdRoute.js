import { Router } from "express";
import { addHousehold,joinHousehold,getMembers,myHousehold } from "../controllers/householdController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/",authMiddleware, addHousehold);
router.post("/join",authMiddleware, joinHousehold);
router.get("/me",authMiddleware, myHousehold);
router.get("/:id/member",authMiddleware, getMembers);

export default router
