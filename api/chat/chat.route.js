import express from 'express';
import { getChatById, getChatId, getChats } from './chat.controller.js';

const router = express.Router()

router.post("/", getChats)
router.get("/:chatId", getChatById)
router.post("/id", getChatId)


export const chatRoutes = router