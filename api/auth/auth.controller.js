import { loggerService } from "../../services/logger.service.js";
import { authService } from "./auth.service.js";
import { UserService } from "../user/user.service.js";
import axios from 'axios'
const LOGIN_COOKIE_MAX_AGE = 1000 * 60 * 15; //15 minutes
const REFRESH_TOKEN_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days
const ACCESS_COOKIE_OPTIONS = {
  secure: true,
  sameSite: "None",
  maxAge: LOGIN_COOKIE_MAX_AGE,
};
const REFRESH_COOKIE_OPTIONS = {
  secure: true,
  sameSite: "None",
  maxAge: REFRESH_TOKEN_MAX_AGE,
  httpOnly: true
}

export async function login(req, res) {
  console.log('login backend');
  
  try {
    const { username, password } = req.body;
    console.log('username:', username);
    console.log('password:', password);
    
    
    const user = await authService.login(username, password);
    loggerService.info(`User login: ${JSON.stringify(user)}`);

    // loginToken
    const loginToken = authService.getLoginToken(user);
    res.cookie("loginToken", loginToken, ACCESS_COOKIE_OPTIONS);

    //refreshToken
    const refreshToken = authService.getRefreshToken(user);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json(user);
  } catch (err) {
    loggerService.error("couldn't login ", err);
    res.status(401).json(`Couldn't login - ${err}`);
  }
}

export async function signup(req, res) {
  const { credentials } = req.body;
  try {

    const user = await authService.signup(credentials);
    loggerService.info("User signup - ", JSON.stringify(user));

    const miniUser = {
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      score: user.score,
      liked: user.liked,
      imgUrl: user.imgUrl,
      isAdmin: user.isAdmin
    };

    res.json(miniUser);
  } catch (err) {
    loggerService.error("couldn't register ", err);
    res.status(401).send("couldn't register ", err);
  }
}

export async function logout(req, res) {
  try {
    if (!req?.cookies?.loginToken) return res.send('No one logged in')
    res.clearCookie('loginToken');
    res.send('Logged out successfully')
  } catch (err) {
    loggerService.error("couldn't logout", err);
    res.status(401).send("couldn't logout");

  }
}

export async function refreshToken(req, res) {
  
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) { 
    res.clearCookie('loginToken');
    res.clearCookie('refreshToken');
    return res.status(401).send("No refresh token provided");
  }
  try {
    //get new tokens for loggedin user (from token)
    const { user, loginToken, refreshToken: newRefreshToken } = await authService.renewTokens(refreshToken);
    loggerService.info(`Token refreshed for user: ${user._id}`);

    res.cookie("loginToken", loginToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS); 
    res.json(user); 

  } catch (err) { // in case of error -> clear the cookies! 
    loggerService.error("couldn't refresh token:", err);
    res.clearCookie('loginToken');
    res.clearCookie('refreshToken');
    res.status(401).send("Failed to refresh token: " + err);
  }
}

export async function googleLogin(req, res) {
    try {
      const { googleToken } = req.body;

      // Get user info from Google using the access token
      const googleResponse = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleToken}`
      );

      const { email, name, picture, id: googleId } = googleResponse.data;
      console.log('Google user info:', googleResponse.data);

      // Check if user exists by email
      let user = await UserService.query({ email });
      user = user[0]; // query returns array

      if (!user) {
        // Create new user
        const newUser = {
          username: email, // Use email as username
          fullname: name,
          imgUrl: picture,
          googleId,
          email,
          password: null, // No password for Google users
          liked: [],
          score: 50
        };
        user = await UserService.add(newUser);
        loggerService.info(`New Google user created: ${email}`);
      }

      // Create mini user object
      const miniUser = {
        _id: user._id,
        fullname: user.fullname,
        imgUrl: user.imgUrl,
        isAdmin: user.isAdmin || false,
        liked: user.liked || [],
        score: user.score || 50
      };

      // Create tokens
      const loginToken = authService.getLoginToken(miniUser);
      res.cookie("loginToken", loginToken, ACCESS_COOKIE_OPTIONS);

      const refreshToken = authService.getRefreshToken(miniUser);
      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

      res.json(miniUser);
    } catch (err) {
      loggerService.error('Google login failed:', err);
      res.status(401).send('Invalid Google token: ' + err.message);
    }
  }
