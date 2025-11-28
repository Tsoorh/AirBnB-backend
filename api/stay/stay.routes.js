import express from 'express';

const router = express.Router();

router.get("/",getStays)
router.get("/:stayId",getStay)
router.put("/",saveStay)//ownerOnly
router.post("/",saveStay)//hostOnly
router.delete("/:stayId",removeStay)

export const stayRoutes = router;