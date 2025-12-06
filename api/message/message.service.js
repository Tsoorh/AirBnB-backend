export const messageService = {
  query,
  addMsg
}

const COLLECTION = 'chat'

async function query(filterBy = {}) {
  try {
    const criteria = _createCriteria(filterBy)
    const collection = await dbService.getCollection(COLLECTION);
    const chatCurser = await collection.find(filterBy);

    const chats = await chatCurser.toArray();
    return chats;
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
    return message;
  } catch (err) {
    loggerService.error("Cannot save chat ", err);
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

