
import { Server } from 'socket.io'
import { messageService } from '../api/message/message.service.js'
import { ObjectId } from 'mongodb'


// import { setupSocketHandlers } from '../socket/index.socket.js'

let gIo = null

export const socketService = {
    setupSocketAPI,
    emitTo,
    emitToUser,
    broadcast
}

//init to socket
function setupSocketAPI(httpServer, corsOptions) {
    gIo = new Server(httpServer, {
        cors: {
            origin: corsOptions.origin,
            methods: ["GET", "POST"]
        }
    })

    gIo.on('connection', (socket) => {
        console.log(`New user connection: ${socket.id}`)

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`)
        })

        // setupSocketHandlers(gIo,socket)
        // join room by user id to send privte notification
        // socket.on('set-user-socket', (userId) => {
        //     console.log(`Setting socket.userId = ${userId} for socket [${socket.id}]`)
        //     socket.userId = userId
        //     socket.join(userId) // the room name is userId
        // })

        //join specific room
        socket.on('chat-set-topic', (topic) => {
            if (socket.myTopic === topic) return
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
            socket.myTopic = topic
        })

        socket.on('chat-send-msg',async (msg) => {
            console.log('New chat msg', msg)
            const msgFormat = {
                ...msg,
                senderId : new ObjectId(msg.senderId)
            }
            const msgRes = await messageService.addMsg(msgFormat)
            const msgToEmit = await messageService.getById(msgRes._id)
            //send to all except myself
            const room = msg.chatId || socket.myTopic
            socket.broadcast.to(room).emit('chat-add-msg', msgToEmit)
            //send to all include me
            // gIo.to(socket.myTopic).emit('chat-add-msg', msg)
        })
    })
}

//send to all but except socket
function broadcast({ type, data, room = null, userId }) {
    userId = userId?.toString()

    console.log(`Broadcasting event: ${type}`)
    const excludedSocket = _getUserSocket(userId)

    if (room && excludedSocket) {
        console.log(`Broadcasting to room ${room} excluding user: ${userId}`)
        excludedSocket.broadcast.to(room).emit(type, data)
    } else if (excludedSocket) {
        console.log(`Broadcasting to all excluding user: ${userId}`)
        excludedSocket.broadcast.emit(type, data)
    } else if (room) {
        console.log(`Emitting to room: ${room}`)
        gIo.to(room).emit(type, data)
    } else {
        console.log(`Emitting to all`)
        gIo.emit(type, data)
    }
}

//emit to specific room or to all
function emitTo({ type, data, label }) {
    if (label) gIo.to(label).emit(type, data)
    else gIo.emit(type, data)
}

//Private msg
function emitToUser({ type, data, userId }) {
    userId = userId?.toString()
    const socket = _getUserSocket(userId)

    if (socket) {
        console.log(`Emitting to user ${userId} socket [${socket.id}]`)
        socket.emit(type, data)
    } else {
        console.log(`Emitting to user room: ${userId}`)
        gIo.to(userId).emit(type, data)
    }
}

//helper for finding private socket
function _getUserSocket(userId) {
    const sockets = gIo.sockets.sockets
    for (const [socketId, socket] of sockets) {
        if (socket.userId === userId) return socket
    }
    return null
}