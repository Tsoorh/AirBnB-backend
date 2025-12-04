import express from 'express'
import { addReview, removeReview  } from './review.controller.js'
import { requireAuth } from '../../middlewares/require-auth.middleware.js'

const router = express.Router()


router.post("/:stayId",requireAuth,addReview)
router.delete("/:stayId/:reviewId",requireAuth,removeReview)


export const reviewRoutes = router;