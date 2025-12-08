import { messageService } from "../api/message/message.service.js"


export function registerChatHandlers(io, socket) {
    
    socket.on('chat-set-topic', (topic) => {
        if (socket.myTopic === topic) return
        if (socket.myTopic) {
            socket.leave(socket.myTopic)
        }
        socket.join(topic)
        socket.myTopic = topic
    })

    socket.on('chat-send-msg' ,async (msg) => {
        console.log("🚀 ~ registerChatHandlers ~ msg:", msg)
        await messageService.addMsg(msg)
        socket.broadcast.to(socket.myTopic).emit('chat-add-msg', msg)
    })
}