import { ObjectId } from "mongodb";
import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js";
import { stayService } from "../stay/stay.service.js";

export const reviewService = {
    add,
    remove
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

export async function remove(stayId,reviewId) {
    // const { loggedinUser } = asyncLocalStorage.getStore()
    try {    
    const stay = await stayService.getById(stayId);
    // if (!(stay.reviews.byUser._id.toString() === loggedinUser._id.toString() || loggedinUser.isAdmin)) throw new Error('No permission to remove');
    const collection = await dbService.getCollection(COLLECTION);
    const criteria = {_id:new ObjectId(stayId)}
    const remove =  {$pull :{reviews:{_id: reviewId}}}
    const res = collection.updateOne(criteria, remove)

    if (res.matchedCount === 0) throw new Error("Couldn't find stay to add review")
    return reviewId
    } catch (err) {
         loggerService.error(`Couldn't remove review to stay - ${stayId}`)
        throw err
    }
}




