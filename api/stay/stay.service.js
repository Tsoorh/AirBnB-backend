import { ObjectId } from "mongodb";
import { dbService } from "../../services/db.service.js";
import { loggerService } from "../../services/logger.service.js";

const COLLECTION ='stay';


export const stayService = {
    query,
    getById,
    add,
    update
}

async function query(filterBy) {
    try {
        const collection=await dbService.getCollection(COLLECTION);
        const criteria = _getCriteria(filterBy)
        const stayCursor = await collection.find(criteria);
        
        const stays = stayCursor.toArray();
        return stays
    } catch (err) {
        loggerService.error("Couldn't get stays in query")
        throw err
    }
}

async function getById(stayId){
    try {
        const collection=await dbService.getCollection(COLLECTION);
        const criteria= {_id:ObjectId.createFromHexString(stayId)}
        
        const stay =await collection.findOne(criteria);
        return stay
    } catch (err) {
        loggerService.error("Couldn't get stay by id")
        throw err
    }
}

async function add(stay){
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const res =await collection.insertOne(stay)

        if(!res.acknowledged) return {success:false,message:"Not added"}

        stay._id = res.insertedId
        
    } catch (err) {
        loggerService.error("Couldn't add stay")
        throw err
    }
}

async function update(stay){
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const criteria = {_id:ObjectId.createFromHexString(stay._id)}
        const {_id,...nonIdStay} = stay
        const update = {$set:nonIdStay}
        const res = await collection.updateOne(criteria,update)

        if(res.matchedCount===0) return {success:false, message:"Stay not found"}
        if(res.modifiedCount===1){
            return {success:true, message:"Updated"}
        } else{
            return {success:true, message:"No changes"}
        }
    } catch (err) {
        loggerService.error("Couldn't update stay")
        throw err
    }
}



function _getCriteria(filterBy){
    const criteria ={}

    if(filterBy.city){
        criteria.city = filterBy.city
    }
    if(filterBy.who){
        if(filterBy.who.pets){
            criteria.houseRules="Pets allowed (with fee)"
        }
        if(filterBy.who.adults || filterBy.who.children){
            const guests = filterBy.who?.adults + filterBy.who?.children
            criteria.capacity = {$gte:{guests}}
        }
    }
    if(filterBy.dates){
        criteria.unavailable = {
            $not:{
                $elemMatch:{
                    "startDate":{$lt: filterBy.dates.checkOut},
                    "endDate":{$gt: filterBy.dates.checkIn},
                }
            }
        }
    }
    return criteria
}
