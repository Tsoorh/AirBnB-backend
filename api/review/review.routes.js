import express from 'express'
import { addReview, removeReview  } from './review.controller.js'

const router = express.Router()


router.post("/:stayId",addReview)
router.put("/:stayId/:reviewId",removeReview)


export const reviewRoutes = router;