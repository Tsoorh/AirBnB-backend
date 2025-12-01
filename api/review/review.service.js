import { ObjectId } from "mongodb";
import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js";

export const reviewService = {
    add,
    update
}

const COLLECTION = 'stay'

export async function add(stayId, review) {
    try {
        const collection = await dbService.getCollection(COLLECTION);
        const criteria = { _id: new ObjectId(stayId) }
        const update = { $push: { reviews: review } }
        const res = collection.updateOne(criteria, update)

        if (res.matchedCount === 0) throw new Error("Couldn't find stay to add review")
        return review;
    } catch (err) {
        loggerService.error(`Couldn't add review to stay - ${stayId}`)
        throw err
    }

}
export async function update(stayId, review) {
    try {
        const collection = await dbService.getCollection(COLLECTION);
        const criteria = { _id: new ObjectId(stayId), "reviews._id": review._id }
        const set = { $set: { "reviews.txt": review.txt, "review.rating": review.rating } }
        const res = collection.updateOne(criteria, set)

        if (res.matchedCount === 0) throw new Error("Couldn't find stay to update review")
    } catch (err) {
        loggerService.error(`Couldn't update review at stay - ${stayId}`)
        throw err
    }

}



