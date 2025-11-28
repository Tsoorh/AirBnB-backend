import express from 'express';
import { getUser, getUsers, removeUser, saveUser } from './user.controller.js';
import { adminOnly } from '../../middlewares/adminOnly.middleware.js';
import { signup } from '../auth/auth.controller.js';
import { requireAuth } from '../../middlewares/require-auth.middleware.js';

const router = express.Router();

router.get("/",adminOnly,getUsers)
router.get("/:userId",getUser)
router.get("/stay/:userId",getUser) // get user stays // not sure if it belongs to stay? 
router.put("/:userId",requireAuth,saveUser)
router.post("/",signup)
router.delete("/:userId",removeUser)

export const userRoutes = router;

