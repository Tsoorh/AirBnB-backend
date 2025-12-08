import { loggerService } from "../../services/logger.service.js";
import { chatService } from "./chat.service.js";


export async function getChats(req, res) {
    const filterBy = {
        userId: req.body.userId || '',
        participants: req.body.participants || [],
        type: req.body.type || ''
    }
    try {
        const chats = await chatService.query(filterBy)
        res.send(chats)
    } catch (err) {
        console.log("🚀 ~ getChats ~ err:", err)
        loggerService.error("Couldn't get chats")
        res.status(400).send("Couldn't get chats")
    }
}

export async function getChatById(req, res) {

    const { chatId } = req.params
    try {
        const chat = await chatService.getById(chatId)
        res.send(chat)
    } catch (err) {
        console.log("🚀 ~ getChatById ~ err:", err)
        loggerService.error("Couldn't get chat")
        res.status(400).send("Couldn't get chat")
    }
}

export async function getChatId(req, res) {
    const participants = req.body
    const filterBy = {
        participants: participants
    }
    try {
        let chat = await chatService.query(filterBy) // return array
        if (chat.length===0) {
            const chatFormat = {
                type: (participants.length === 2) ? "direct" : "group",
                participants: [...filterBy.participants],
                lastMessage: {
                    text: '',
                    createdAt: ''
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }
            chat = await chatService.create(chatFormat) // return new chat Obj
            res.send(chat._id)
        }
        res.send(chat[0]._id)
    } catch (err) {
        console.log("🚀 ~ getChatById ~ err:", err)
        loggerService.error("Couldn't get chat")
        res.status(400).send("Couldn't get chat")
    }
}
