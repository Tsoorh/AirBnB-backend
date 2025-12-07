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
  saveRefreshToken,
  isValidRefreshToken,
  deleteRefreshToken
};

async function query(filterBy = {}) {
  try {
    const criteria = _createCriteria(filterBy)
    console.log("🚀 ~ query ~ criteria:", criteria)
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
  const criteria = { _id: new ObjectId(userId) }
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
  const { loggedinUser } = asyncLocalStorage.getStore()
  if (!(user._id.toString() === loggedinUser._id.toString() || loggedinUser.isAdmin)) throw new Error('No permission to update user');

  try {

    const collection = await dbService.getCollection(COLLECTION);
    const { _id, ...nonIdUser } = user
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
  const { loggedinUser } = asyncLocalStorage.getStore()
  if (!(userId.toString() === loggedinUser._id.toString() || loggedinUser.isAdmin)) throw new Error('No permission to remove user');
  try {
    const criteria = { _id: ObjectId.createFromHexString(userId) }
    const collection = await dbService.getCollection(COLLECTION);
    const res = await collection.deleteOne(criteria)

    if (res.deletedCount === 0) throw new Error(`Cannot remove user ${userId}`);

    return userId
  } catch (err) {
    loggerService.error('couldnt remove user')
  }
}


async function saveRefreshToken(userId, refreshToken) {
    try {
        const collection = await dbService.getCollection(COLLECTION);
        const criteria = { _id: new ObjectId(userId) };
        
        const res = await collection.updateOne(
            criteria,
            { $addToSet: { refreshTokens: refreshToken } }
            // $addToSet מבטיח שהאסימון יישמר רק אם אינו קיים כבר
        );
        
        if (res.modifiedCount === 0 && res.upsertedCount === 0) {
            // אם המשתמש קיים והאסימון כבר שם (פחות קריטי), או אם לא נמצא משתמש.
            // עבור מנגנון Rotation עדיף להחליף או לבדוק קודם.
            loggerService.warn(`Could not save refresh token for user ${userId}`);
        }
        
    } catch (err) {
        loggerService.error(`Cannot save refresh token for user ${userId}`, err);
        throw err;
    }
}

async function isValidRefreshToken(userId, refreshToken) {
    try {
        const collection = await dbService.getCollection(COLLECTION);
        const criteria = { 
            _id: new ObjectId(userId), 
            refreshTokens: refreshToken 
        };
        
        const user = await collection.findOne(criteria);
        
        return !!user;
        
    } catch (err) {
        loggerService.error(`Error checking refresh token validity for user ${userId}`, err);
        return false;
    }
}

/**
 * 💡 מוחקת את אסימון הרענון (בשימוש בתהליך Rotation או Logout).
 */
async function deleteRefreshToken(refreshToken) {
    try {
        const collection = await dbService.getCollection(COLLECTION);
        
        // מוצאת את המשתמש שמכיל את האסימון ומוחקת אותו מהמערך
        const res = await collection.updateOne(
            { refreshTokens: refreshToken },
            { $pull: { refreshTokens: refreshToken } }
        );
        
        if (res.modifiedCount === 0) {
            loggerService.warn(`Refresh token not found or already deleted: ${refreshToken}`);
        }
        
    } catch (err) {
        loggerService.error(`Cannot delete refresh token ${refreshToken}`, err);
        throw err;
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
  if (filterBy.email) {
    criteria.email = filterBy.email
  }
  if (filterBy.isAdmin !== undefined) criteria["isAdmin"] = filterBy.isAdmin
  return criteria;
}

