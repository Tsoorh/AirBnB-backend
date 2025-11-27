import express from 'express';
import { getUser, getUsers, removeUser, saveUser } from './user.controller.js';
import { adminOnly } from '../../middlewares/adminOnly.middleware.js';
import { signup } from '../auth/auth.controller.js';

const router = express.Router();

router.get("/",adminOnly,getUsers)
router.get("/:userId",adminOnly,getUser)
router.put("/:userId",adminOnly,saveUser)
router.post("/",signup)
router.delete("/:userId",adminOnly,removeUser)

export const userRoutes = router;

