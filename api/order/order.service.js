import { ObjectId } from "mongodb";
import { dbService } from "../../services/db.service.js";
import { loggerService } from "../../services/logger.service.js";
import { asyncLocalStorage } from "../../services/als.service.js";

const COLLECTION = 'order';


export const orderService = {
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
        const orderCursor = await collection.find(criteria);

        const orders = await orderCursor.toArray();
        return orders
    } catch (err) {
        loggerService.error("Couldn't get orders in query")
        throw err
    }
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection(COLLECTION);
        const criteria = { _id: new ObjectId(orderId) }

        const order = await collection.findOne(criteria);
        return order
    } catch (err) {
        loggerService.error("Couldn't get order by id")
        throw err
    }
}

async function add(order) {
    try {
        console.log('order to save: ', order);
        const collection = await dbService.getCollection(COLLECTION)
        const res = await collection.insertOne(order)
        if (!res.acknowledged) throw new Error("Couldn't add order")
        order["_id"] = res.insertedId
        return order
    } catch (err) {
        loggerService.error("Couldn't add order")
        throw err
    }
}

async function update(order) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    if (!(order.host._id.toString() === loggedinUser._id.toString() || loggedinUser.isAdmin)) throw new Error('No permission to update');
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const { _id, ...nonIdOrder } = order;
        const criteria = { _id: ObjectId.createFromHexString(_id) }

        const orderExist = await collection.findOne(criteria)
        if (!orderExist) throw new Error("Couldn't find order to update")

        const update = { $set: nonIdOrder }
        const res = await collection.updateOne(criteria, update)

        if (!res.acknowledged) throw new Error("Couldn't update order")

        return order
    } catch (err) {
        loggerService.error("Couldn't update order")
        throw err
    }
}

async function remove(orderId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    // if (!(orderId.toString() === loggedinUser._id.toString() || loggedinUser.isAdmin)) throw new Error('No permission to remove');
    try {
        const collection = await dbService.getCollection(COLLECTION);
        const criteria = { _id: new ObjectId(orderId) }
        const orderExist = await collection.findOne(criteria)
        if (!orderExist) throw new Error("Couldn't find order to remove")

        if (!(orderExist.host._id === loggedinUser._id.toString() || loggedinUser.isAdmin)) 
            throw new Error('No permission to remove')

        const res = await collection.deleteOne(criteria);
        if (res.deletedCount === 0) throw new Error("Couldn't delete order")

        return orderId
    } catch (err) {
        loggerService.error("Couldn't update order")
        throw err
    }

}

function _getCriteria(filterBy) {
    const criteria = {}
    if (filterBy.hostId) criteria.hostId = filterBy.hostId
    if (filterBy.guestId) criteria.guestId = filterBy.guestId
    if(filterBy.status) criteria.status = filterBy.status
    if(filterBy.stayId) criteria.stayId = filterBy.stayId   
    return criteria
}

function _checkOwner(loggedinUser, orderOwner) {

}