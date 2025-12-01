import { loggerService } from "../../services/logger.service.js";
import { authService } from "./auth.service.js";

const LOGIN_COOKIE_MAX_AGE = 1000 * 60 * 15; //15 minutes
// const REFRESH_TOKEN_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days
const COOKIE_OPTIONS = {
  secure: true,
  sameSite: "None",
  maxAge: LOGIN_COOKIE_MAX_AGE,
};

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await authService.login(username, password);
    loggerService.info(`User login: ${JSON.stringify(user)}`);

    // cookie
    const loginToken = authService.getLoginToken(user);
    res.cookie("loginToken", loginToken, COOKIE_OPTIONS);
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

