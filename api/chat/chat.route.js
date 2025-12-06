import express from 'express';
import { getChatById, getChats } from './chat.controller.js';

const router = express.Router()

router.get("/", getChats)
router.get("/:chatId", getChatById)


export const chatRoutes = router