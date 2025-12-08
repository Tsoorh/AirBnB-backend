import express from 'express';
import { getChatById, getChatId, getChats } from './chat.controller.js';

const router = express.Router()

router.get("/", getChats)
router.get("/:chatId", getChatById)
router.post("/", getChatId)


export const chatRoutes = router