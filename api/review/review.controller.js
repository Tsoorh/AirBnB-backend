import { asyncLocalStorage } from "../../services/als.service.js"
import { loggerService } from "../../services/logger.service.js"
import { makeId } from "../../services/utils.js"
import { reviewService } from "./review.service.js"

export async function addReview(req,res) {
    const {stayId}=req.params
    const {review} = req.body
    review._id = makeId(7);
    const {loggenInUser} = asyncLocalStorage.getStore()
    review.createdAt = new Date();
    review.byUser = {
        _id:loggenInUser._id,
        fullname:loggenInUser.fullname,
        imgUrl:loggenInUser.imgUrl
    }
    try {
        const reviewRes = await reviewService.add(stayId,review)
        res.send(reviewRes)
    } catch (err) {
        loggerService.error("Couldnt add review",err)
        res.status(400).send("Couldnt add review")   
    }
}
export async function removeReview(req,res) {
    const {stayId,reviewId}=req.params
    try {       
        const reviewRes = await reviewService.remove(stayId,reviewId)
        res.send(reviewRes)
    } catch (err) {
        loggerService.error("Couldnt remove review",err)
        res.status(400).send("Couldnt remove review")   
    }
}