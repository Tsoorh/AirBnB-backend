import { registerChatHandlers } from './chat.socket.js';

export function setupSocketHandlers(io, socket) {
    registerChatHandlers(io, socket);
}