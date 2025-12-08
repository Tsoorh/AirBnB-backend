import { lookup } from "dns";
import { dbService } from "../../services/db.service.js";
import { loggerService } from "../../services/logger.service.js";
import { chatService } from "../chat/chat.service.js";
import { ObjectId } from "mongodb";

export const messageService = {
  query,
  addMsg,
  getById
}

const COLLECTION = 'message'

async function query(filterBy = {}) {
  try {
    const criteria = _createCriteria(filterBy)
    const collection = await dbService.getCollection(COLLECTION);
    const pipeline = _getAgrPipeline(criteria)
    const msgsWithUserDetailsCursor = await collection.aggregate(pipeline)
    const msgs = await msgsWithUserDetailsCursor.toArray();

    return msgs;
  } catch (err) {
    loggerService.error("Cannot get chats: ", err);
    throw err;
  }
}

async function addMsg(message) {
  try {
    const collection = await dbService.getCollection(COLLECTION);
    const res = await collection.insertOne(message)

    if (!res.acknowledged) throw new Error('Couldnt insert new chat')
    message["_id"] = res.insertedId

    const newChat = await chatService.update(message)
    if (!newChat) throw new Error('Coulnt update chat')

    return message;
  } catch (err) {
    loggerService.error("Cannot add message");
    throw err;
  }
}

async function getById(msgId) {
  try {
    const collection = await dbService.getCollection(COLLECTION)
    const criteria = { _id: new ObjectId(msgId) }
    const pipeline = _getAgrPipeline(criteria)
    const msgCurser = await collection.aggregate(pipeline)
    const msg = await msgCurser.toArray()
    if (msg.length === 0) throw new Error("Couldnt find message")

    return msg[0]
  } catch (err) {
    loggerService.error("Cannot get message");
    throw err;
  }
}

function _createCriteria(filterBy) {
  const criteria = {}
  if (filterBy.chatId) {
    criteria.chatId = filterBy.chatId
  }
  return criteria
}

function _getAgrPipeline(criteria) {
  return[
    {
      $match: criteria
    },
    {
      $lookup: {
        from: 'user',
        localField: 'senderId',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: "$userDetails"
    },
    {
      $project: {
        chatId: 1,
        type: 1,
        lastMessage: 1,
        text: 1,
        attachments: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        "userDetails.fullname": 1,
        "userDetails._id": 1,
        "userDetails.imgUrl": 1
      }
    }
  ]
}