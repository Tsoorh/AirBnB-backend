import { ObjectId } from "mongodb";
import { dbService } from "../../services/db.service.js";
import { loggerService } from "../../services/logger.service.js";
import { asyncLocalStorage } from "../../services/als.service.js";

const COLLECTION = 'stay';


export const stayService = {
    query,
    getById,
    add,
    update,
    remove
}

async function query(filterBy) {
    console.log('filterBy from service:', filterBy);
    
    try {
        const collection = await dbService.getCollection(COLLECTION);
        const criteria = _getCriteria(filterBy)
        const stayCursor = await collection.find(criteria);

        const stays = await stayCursor.toArray();
        return stays
    } catch (err) {
        loggerService.error("Couldn't get stays in query")
        throw err
    }
}

async function getById(stayId) {
    try {
        const collection = await dbService.getCollection(COLLECTION);
        const criteria = { _id: new ObjectId(stayId) }

        const stay = await collection.findOne(criteria);
        return stay
    } catch (err) {
        loggerService.error("Couldn't get stay by id")
        throw err
    }
}

async function add(stay) {
    try {

        const collection = await dbService.getCollection(COLLECTION)
        const res = await collection.insertOne(stay)
        if (!res.acknowledged) throw new Error("Couldn't add stay")

        stay["_id"] = res.insertedId
        return stay
    } catch (err) {
        loggerService.error("Couldn't add stay")
        throw err
    }
}

async function update(stay) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    // if (!(stay.ownerId.toString() === loggedinUser._id.toString() || loggedinUser.isAdmin)) throw new Error('No permission to update');
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const { _id, ...nonIdStay } = stay;
        const criteria = { _id: ObjectId.createFromHexString(_id) }

        const stayExist = await collection.findOne(criteria)
        if (!stayExist) throw new Error("Couldn't find stay to update")

        const update = { $set: nonIdStay }
        const res = await collection.updateOne(criteria, update)

        if (!res.acknowledged) throw new Error("Couldn't update stay")

        return stay
    } catch (err) {
        loggerService.error("Couldn't update stay")
        throw err
    }
}

async function remove(stayId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    // if (!(stayId.toString() === loggedinUser._id.toString() || loggedinUser.isAdmin)) throw new Error('No permission to remove');
    try {
        const collection = await dbService.getCollection(COLLECTION);
        const criteria = { _id: new ObjectId(stayId) }
        const stayExist = await collection.findOne(criteria)
        if (!stayExist) throw new Error("Couldn't find stay to remove")

        if (!(stayExist.ownerId.toString() === loggedinUser._id.toString() || loggedinUser.isAdmin)) throw new Error('No permission to remove');

        const res = await collection.deleteOne(criteria);
        if (res.deletedCount === 0) throw new Error("Couldn't delete stay")

        return stayId
    } catch (err) {
        loggerService.error("Couldn't update stay")
        throw err
    }

}

function _getCriteria(filterBy) {
    const criteria = {}
    
    if (filterBy.ownerId) {
        criteria.ownerId = filterBy.ownerId
    }
    
    if (filterBy.city) {
        criteria["loc.city"] = filterBy.city
    }
    
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            { name: txtCriteria },
            { summary: txtCriteria }
        ]
    }
    
    if (filterBy.labels && filterBy.labels.length > 0) {
        criteria.labels = { $in: filterBy.labels }
    }
    
    if (filterBy.minPrice || filterBy.maxPrice) {
        criteria["price.base"] = {}
        if (filterBy.minPrice) criteria["price.base"].$gte = filterBy.minPrice
        if (filterBy.maxPrice) criteria["price.base"].$lte = filterBy.maxPrice
    }
    
    if (filterBy.guests) {
        if (filterBy.guests.pets > 0) {
            criteria.$or = criteria.$or || []
            criteria.$or.push(
                { houseRules: { $regex: "Pets allowed", $options: 'i' } },
                { amenities: { $regex: "pet", $options: 'i' } }
            )
        }
        
        const totalGuests = (filterBy.guests.adults || 0) + (filterBy.guests.children || 0)
        if (totalGuests > 0) {
            criteria["capacity.guests"] = { $gte: totalGuests }
        }
    }
    
    if (filterBy.dates && filterBy.dates.checkIn && filterBy.dates.checkOut) {
        criteria.unavailable = {
            $not: {
                $elemMatch: {
                    startDate: { $lte: new Date(filterBy.dates.checkOut) },
                    endDate: { $gte: new Date(filterBy.dates.checkIn) }
                }
            }
        }
    }
    
    return criteria
}

function _checkOwner(loggedinUser, stayOwner) {

}