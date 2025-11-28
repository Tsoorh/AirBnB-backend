import { ObjectId } from "mongodb";
import { dbService } from "../../services/db.service.js";
import { loggerService } from "../../services/logger.service.js";
import { asyncLocalStorage } from "../../services/als.service.js";

const COLLECTION = 'user'
export const UserService = {
  query,
  getById,
  getByUser,
  add,
  update,
  remove,
};

async function query(filterBy = {}) {
  try {
    const criteria = _createCriteria(filterBy)
    const collection = await dbService.getCollection(COLLECTION);
    const userCurser = await collection.find(criteria);

    const users = await userCurser.toArray();
    return users;
  } catch (err) {
    loggerService.error("Cannot get users: ", err);
    throw err;
  }
}

async function getById(userId) {
  const criteria = { _id: ObjectId.createFromHexString(userId) }
  try {
    const collection = await dbService.getCollection(COLLECTION);
    const user = await collection.findOne(criteria)
    if (!user) throw new Error("Cannot find user by Id");

    return user;
  } catch (err) {
    loggerService.error(`cannot find user id : ${userId}`, err);
    throw err;
  }
}

async function getByUser(username) {
  const criteria = { username }
  try {
    const collection = await dbService.getCollection(COLLECTION);
    const user = await collection.findOne(criteria)

    return user;
  } catch (err) {
    loggerService.error("cannot get user by username", err);
    throw err;
  }
}

async function add(userToSave) {
  try {
    const collection = await dbService.getCollection(COLLECTION);
    userToSave.isAdmin = false;

    const res = await collection.insertOne(userToSave)

    if (!res.acknowledged) throw new Error('Couldnt insert new user')
    userToSave["_id"] = res.insertedId

    return userToSave;
} catch (err) {
  loggerService.error("Cannot save user ", err);
  throw err;
}
}

async function update(user) {
  try {
    const collection = await dbService.getCollection(COLLECTION);
    const { _id, ...nonIdUser } = userToSave
    const criteria = { _id: new ObjectId(_id) };
    const userExist = await collection.findOne(criteria)

    if (!userExist) throw new Error("Cannot find user to update");

    const setUser = { $set: nonIdUser }
    const res = await collection.updateOne(criteria, setUser)

    if (res.modifiedCount === 0) throw new Error('Couldnt update user')
  } catch (err) {
  }
}

async function remove(userId) {
  const { loggedinUser } = asyncLocalStorage.getStore();
  const { isAdmin } = loggedinUser;
  try {

    if (!isAdmin) return 'Only admin can manage users!' //q: change to middleware?

    const criteria = { _id: ObjectId.createFromHexString(userId) }
    const collection = await dbService.getCollection(COLLECTION);
    const res = await collection.deleteOne(criteria)

    if (res.deletedCount === 0) throw new Error(`Cannot remove user ${userId}`);

    return userId
  } catch (err) {
    loggerService.error('couldnt remove user')
  }
}


function _createCriteria(filterBy) {
  const criteria = {}
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy?.txt, $options: 'i' }
    criteria.$or = [{
      username: txtCriteria
    }, {
      fullname: txtCriteria
    }]
  }
  if (filterBy.isAdmin !== undefined) criteria["isAdmin"] = filterBy.isAdmin
  return criteria;
}

