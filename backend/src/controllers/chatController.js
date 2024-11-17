import ChatService from '../services/chatService.js';

class ChatController {
    constructor() {
        this.chatService = new ChatService();
    }

    connect = (socket) => {
        // connect to server (/chat)
        console.log('[chatController] -----connect-----');

        try {
            const userID = socket.handshake.auth.user.id;
            this.chatService.connect(socket, userID);
        } catch {
            console.error(`[chatController] Error when connecting chat websocket`);
        }
    };

    joinChatroom = (socket, payload) => {
        console.log('[chatController] -----joinChatroom-----');
        const userID = socket.handshake.auth.user.id;

        try {
            const chatroomName = payload.chatroomName;
            this.chatService.joinChatroom(socket, chatroomName);
        } catch {
            console.error(`[chatController] Error when joining chatroom for ${userID}`);
            this.chatService.systemMessage(socket, 'join chatroom', 'error');
        }
    };

    chatMessage = (socket, payload) => {
        console.log('[chatController] -----chatMessage-----');
        const userID = socket.handshake.auth.user.id;

        try {
            const chatroomName = payload.chatroomName;
            const message = payload.message;
            this.chatService.chatMessage(socket, chatroomName, message);
        } catch {
            console.error(`[chatController] Error when user ${userID} send chat message`);
            this.chatService.systemMessage(socket, 'chat message', 'error');
        }
    };

    disconnect = (socket, reason) => {
        console.log('[chatController] -----disconnect-----');
        this.chatService.disconnect(socket, reason);
    };

    invalidEvent = (socket) => {
        console.log('[chatController] -----invalid event-----');
        this.chatService.systemMessage(socket, 'invalid event', 'fail');
    };
}

export default ChatController;
