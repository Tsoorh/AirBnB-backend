import { ObjectId } from "mongodb";
import { dbService } from "../../services/db.service.js";
import { loggerService } from "../../services/logger.service.js";

const COLLECTION = 'stay';


export const stayService = {
    query,
    getById,
    add,
    update,
    remove
}

async function query(filterBy) {
    try {
        const collection = await dbService.getCollection(COLLECTION);
        const criteria = _getCriteria(filterBy)
        const stayCursor = await collection.find(criteria);

        const stays = stayCursor.toArray();
        return stays
    } catch (err) {
        loggerService.error("Couldn't get stays in query")
        throw err
    }
}

async function getById(stayId) {
    try {
        const collection = await dbService.getCollection(COLLECTION);
        const criteria = { _id: ObjectId.createFromHexString(stayId) }

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

        stay._id = res.insertedId
    } catch (err) {
        loggerService.error("Couldn't add stay")
        throw err
    }
}

async function update(stay) {
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
    try {
        const collection = await dbService.getCollection(COLLECTION);
        const criteria = { _id: new ObjectId(stayId) }
        const stayExist = await collection.findOne(criteria)
        if (!stayExist) throw new Error("Couldn't find stay to remove")

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

    if (filterBy.city) {
        criteria.city = filterBy.city
    }
    if (filterBy.who) {
        if (filterBy.who.pets) {
            criteria.houseRules = "Pets allowed (with fee)"
        }
        if (filterBy.who.adults || filterBy.who.children) {
            const guests = filterBy.who?.adults + filterBy.who?.children
            criteria.capacity = { $gte: { guests } }
        }
    }
    if (filterBy.dates) {
        criteria.unavailable = {
            $not: {
                $elemMatch: {
                    "startDate": { $lt: filterBy.dates.checkOut },
                    "endDate": { $gt: filterBy.dates.checkIn },
                }
            }
        }
    }
    return criteria
}
