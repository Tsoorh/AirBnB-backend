import { ObjectId } from "mongodb";
import { loggerService } from "../../services/logger.service.js";
import { dbService } from "../../services/db.service.js";

export const chatService = {
  query,
  getById,
  create,
  update
}

const COLLECTION = 'chat'

async function query(filterBy = {}) {
  try {
    const criteria = _createCriteria(filterBy)
    const collection = await dbService.getCollection(COLLECTION);
    
    const pipeline = [
      { $match: criteria },
      {
        $lookup: {
          from: 'user',
          let: {
            participantIds: '$participants',
            currentUserId: filterBy.userId
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        { $in: ['$_id', '$$participantIds'] },
                        { $in: [{ $toString: '$_id' }, '$$participantIds'] }
                      ]
                    },
                    { $ne: ['$_id', '$$currentUserId'] },
                    { $ne: [{ $toString: '$_id' }, '$$currentUserId'] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                fullname: 1,
                imgUrl: 1
              }
            }
          ],
          as: 'participantsData'
        }
      }
    ];

    const chats = await collection.aggregate(pipeline).toArray();

    return chats;
  } catch (err) {
    console.log("🚀 ~ query ~ err:", err)
    loggerService.error("Cannot get chats: ", err);
    throw err;
  }
}

async function getById(chatId) {
  const criteria = { _id: new ObjectId(chatId) }
  try {
    const collection = await dbService.getCollection(COLLECTION);
    const chat = await collection.findOne(criteria)
    if (!chat) throw new Error("Cannot find chat by Id");
    
    return chat;
  } catch (err) {
    loggerService.error(`cannot find chat id : ${chatId}`, err);
    throw err;
  }
}

async function create(chatFormat) {
  try {
    const collection = await dbService.getCollection(COLLECTION);

    const res = await collection.insertOne(chatFormat)
    if (!res.acknowledged) throw new Error('Couldnt insert new chat')
    chatFormat["_id"] = res.insertedId

    return chatFormat;
  } catch (err) {
    loggerService.error("Cannot save chat ", err);
    throw err;
  }
}

async function update(message) {
  const { chatId, createdAt, text } = message
  try {
    const collection = await dbService.getCollection(COLLECTION);
    const criteria = { _id: new ObjectId(chatId) }
    const set = {
      $set: {
        updatedAt: createdAt,
        "lastMessage.createdAt": createdAt,
        "lastMessage.text": text,
      }
    }
    let chat = await collection.findOneAndUpdate(criteria, set)

    if (!chat) throw new Error('Couldnt find chat and update')

    return chat;
  } catch (err) {
    loggerService.error("Couldn't update chat ", err);
    throw err;
  }
}

function _createCriteria(filterBy) {
  var criteria = {}
  if (filterBy.userId) {
    criteria = { "participants": filterBy.userId }
  }
  if (filterBy.participants) {
    criteria.participants = { $all: filterBy.participants }
  }
  if (filterBy.type) {
    criteria.type = filterBy.type
  }
  return criteria
}

