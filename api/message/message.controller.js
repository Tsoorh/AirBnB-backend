import { asyncLocalStorage } from "../../services/als.service.js";
import { loggerService } from "../../services/logger.service.js";
import { socketService } from "../../services/socket.service.js";
import { chatService } from "../chat/chat.service.js";
import { messageService } from "./message.service.js";


export async function getMessages(req, res) {
    const filterBy = {
        chatId: req.query.chatId || ''
    }
    try {
        const messages = await messageService.query(filterBy)
        res.send(messages)
    } catch (err) {
        console.log("🚀 ~ getMessages ~ err:", err)
        loggerService.error("Couldn't get messages")
        res.status(400).send("Couldn't get messages")
    }
}


export async function addMessage(req, res) {
    const message = req.body
    try {
        if (message.chatId) {
            //add to messages
            const msgWithId = await messageService.addMessage(message)
            if (!msgWithId) res.status(400).send("Couldn't add message")

            //update last message on the chat + updatedAt
            const updatedChat = await chatService.update(message)
            if (!updatedChat) res.status(400).send("Couldn't update chat")
            socketService.emitToUser({ type: 'chat-add-msg', data: message.text, userId: message.receiverId })
            res.send({ chat: updatedChat, message: msgWithId })
        } else {
            const chatFormat = {
                type: message.type,
                participants: [{
                    userId: message.senderId,
                    joinedAt: message.createdAt
                }, message.receiverId.map(participantId => {
                    return {
                        userId: participantId,
                        joinedAt: message.createdAt
                    }
                })
                ],
                lastMessage: {
                    text: message.text,
                    createdAt: message.createdAt
                },
                createdAt: message.createdAt,
                updatedAt: message.updatedAt
            }
            const newChat = await chatService.create(chatFormat)
            message.chatId= newChat._id
            res.send({ chat: newChat, message: message })
        }
    } catch (err) {
        console.log("🚀 ~ addMessage ~ err:", err)
        loggerService.error("Couldn't add message")
        res.status(400).send("Couldn't add message")
    }
}



