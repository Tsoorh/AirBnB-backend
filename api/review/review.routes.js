import express from 'express'
import { addReview, updateReview } from './review.controller.js'

const router = express.Router()


router.post("/:stayId",addReview)
router.put("/:stayId",updateReview)


export const reviewRoutes = router;