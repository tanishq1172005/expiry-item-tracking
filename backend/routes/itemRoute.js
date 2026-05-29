import { Router } from "express";
import { getItems,addItems,deleteItem,markItem,updateItem } from "../controllers/itemController.js";
import {authMiddleware} from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/',authMiddleware,getItems)
router.post('/',authMiddleware,addItems)
router.put('/:id',authMiddleware,updateItem)
router.patch('/:id/status',authMiddleware,markItem)
router.delete('/:id',authMiddleware,deleteItem)

export default router