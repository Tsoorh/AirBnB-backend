import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import Cryptr from "cryptr";
import { loggerService } from "../../services/logger.service.js";
import { UserService } from "../user/user.service.js";
import { randomInt } from "crypto";

const cryptr = new Cryptr(process.env.SECRET_KEY || 'SecretBYtsoor');

export const authService = {
  login,
  signup,
  getLoginToken,
  validateToken,
  getRefreshToken,
  renewTokens
};

function getLoginToken(user) {
  const jsonUser = JSON.stringify(user);
  const encUser = cryptr.encrypt(jsonUser);
  return encUser;
}

function getRefreshToken(user){
  const refreshToken = cryptr.encrypt(JSON.stringify({_id:user._id}));
  UserService.saveRefreshToken(user._id,refreshToken);
  return refreshToken;
}

function validateToken(token) {
  try {
    const decryptedToken = cryptr.decrypt(token);
    const loggedInUser = JSON.parse(decryptedToken);
    return loggedInUser;
  } catch (err) {
    loggerService.error("couldnt validateToken:", err);
    console.log("couldnt validateToken:", err);
  }
  return null;
}

async function login(username, password) {
  const userExist = await UserService.getByUser(username);
  console.log('service', userExist);
  
  if (!userExist) throw "Unknown user";

  const match = await bcrypt.compare(password, userExist.password);
  if (!match) throw "Invalid username or password";

  const miniUser = {
    _id: userExist._id,
    fullname: userExist.fullname,
    imgUrl:userExist.imgUrl,
    isAdmin: userExist.isAdmin,
    liked:userExist.liked,
    score: userExist.score
  };
  return miniUser;
}

async function signup(credentials) {
  const saltRounds = 10;
  const { username, password, fullname } = credentials
  if (!username || !password || !fullname) throw 'Missing required signup information'

  const userExist = await UserService.getByUser(username);
  if (userExist) throw "Username already exist !";

  const hash = await bcrypt.hash(credentials.password, saltRounds);
  const random= randomInt(1,1000)
  const userToSave = {
    ...credentials,
    password: hash,
    imgUrl: credentials?.imgUrl ||`https://picsum.photos/id/${random}/200/200`,
    liked:[],
    score:50
  };
  return await UserService.add(userToSave);
}

async function renewTokens(refreshToken) {
    const miniUser = authService.validateToken(refreshToken);

    if (!miniUser) throw 'Invalid refresh token format';

    // Check if the user exist and got the refresh token.
    const isValidDB = await UserService.isValidRefreshToken(miniUser._id, refreshToken);
    if (!isValidDB) throw 'Refresh token revoked or expired';

    const user = await UserService.getById(miniUser._id);
    
    // Renew the Tokens - create new
    const newLoginToken = getLoginToken(user); 
    const newRefreshToken = getRefreshToken(user); 
    
    // Delete old token
    UserService.deleteRefreshToken(refreshToken); 

    return { user: user, loginToken: newLoginToken, refreshToken: newRefreshToken };
}