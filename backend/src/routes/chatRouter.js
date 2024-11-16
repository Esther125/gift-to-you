import ChatController from '../controllers/chatController.js';

const VALID_EVENTS = ['join chatroom', 'chat message', 'close chatroom'];

const chatRouter = (chatNameSpace) => {
    const chatController = new ChatController();

    // connect to server (/chat)
    chatNameSpace.on('connection', (socket) => {
        chatController.connect(socket);

        socket.on('join chatroom', (payload) => {
            // join chatroom
            chatController.joinChatroom(socket, payload);
        });

        socket.on('chat message', (payload) => {
            // chat message
            chatController.chatMessage(socket, payload);
        });

        socket.on('disconnect', (reason) => {
            // disconnect with server (/chat)
            chatController.disconnect(socket, reason);
        });

        socket.on('error', (e) => {
            // error
            console.log(`Error in websocket for chat: ${e}`);
        });

        socket.onAny((event) => {
            // invalid events
            if (VALID_EVENTS.includes(event)) {
                return;
            }

            let res = {
                event: 'system message',
                userID: socket.handshake.query.userID,
                socketID: socket.id,
                message: 'Invalid event',
                timestamp: new Date().toISOString(),
            };
            console.log(res);
            socket.emit('system message', JSON.stringify(res));
        });
    });
};

export default chatRouter;
