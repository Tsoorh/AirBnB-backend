import express from 'express';
import { getStay, getStays, removeStay, saveStay } from './stay.controller.js';
import { requireAuth } from '../../middlewares/require-auth.middleware.js';

const router = express.Router();

router.get("/",getStays)
router.get("/:stayId",getStay)
router.put("/",requireAuth,saveStay)//ownerOnly
router.post("/",requireAuth,saveStay)//hostOnly
router.delete("/:stayId",requireAuth,removeStay)

export const stayRoutes = router;