import express from 'express';
import { getOrder, getOrders, removeOrder, saveOrder } from './order.controller.js';
import { requireAuth } from '../../middlewares/require-auth.middleware.js';

const router = express.Router();

router.get("/",getOrders)
router.get("/:orderId",getOrder)
router.put("/",requireAuth,saveOrder)
router.post("/",requireAuth,saveOrder)
router.delete("/:orderId",requireAuth,removeOrder)

export const orderRoutes = router;