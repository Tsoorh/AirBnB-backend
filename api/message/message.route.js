import express from 'express'
import { addMessage, getMessages } from './message.controller.js'

const router = express.Router()

router.get("/:chatId", getMessages)
// router.post("/", addMessage)


export const messageRoutes = router