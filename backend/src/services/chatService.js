class ChatService {
    systemMessage = (socket, stage, status) => {
        // 回傳處理結果通知給 client 用
        const userID = socket.handshake.auth.user.id;
        const res = {
            event: 'system message',
            message: {
                stage,
                status,
            },
            timestamp: new Date().toISOString(),
        };
        socket.emit('system message', res);
        console.log(`[chatService] send system message "${stage}: ${status}" to user ${userID}`);
    };

    connect = (socket, userID) => {
        console.log(`[chatService] user ${userID} ask to connect to /chat websocket server`);

        // 加入以 userID 命名的聊天室
        socket.join(userID);

        // 回傳處理結果通知
        this.systemMessage(socket, 'connect', 'success');
        console.log(`[chatService] user ${userID} connect to /chat websocket server`);
    };

    connectWrongFormat = (socket) => {
        console.log(`[chatService] user ask to connect to /chat websocket server with wrong format`);

        // 回傳處理結果通知
        const res = {
            event: 'system message',
            message: {
                stage: 'connect',
                status: 'fail',
            },
            timestamp: new Date().toISOString(),
        };
        socket.emit('system message', res);
        socket.disconnect();
        console.log(
            `[chatService] send system message to user asked to connect with wrong format and disconnect with the user`
        );
    };

    joinChatroom = (socket, roomToken) => {
        const userID = socket.handshake.auth.user.id;
        console.log(`[chatService] user ${userID} ask to join chatroom ${roomToken}`);

        const inRoom = true; // TODO: 之後再看怎麼接 roomService 來判斷

        if (inRoom) {
            // 加入聊天室
            socket.join(roomToken);

            // 回傳處理結果通知
            this.systemMessage(socket, 'join chatroom', 'success');
            console.log(`[chatService] user ${userID} join chatroom ${roomToken}`);
        } else {
            // 回傳處理結果通知
            this.systemMessage(socket, 'join chatroom', 'fail');
            console.log(`[chatService] user ${userID} is not in room ${roomToken}`);
        }
    };

    chatMessage = (socket, roomToken, message) => {
        const userID = socket.handshake.auth.user.id;
        console.log(`[chatService] user ${userID} ask to send message to chatroom ${roomToken}`);

        // 檢查該 user 是否在該 chatroom 內
        const userJoinedRooms = [...socket.adapter.sids.get(socket.id)];
        if (!userJoinedRooms || !userJoinedRooms.includes(roomToken)) {
            this.systemMessage(socket, 'chat message', 'fail');
            return;
        }

        // 將訊息發給 chatroom 中的對方
        const res = {
            event: 'chat message',
            roomToken,
            message: {
                senderID: userID,
                content: message,
            },
            timestamp: new Date().toISOString(),
        };
        socket.to(roomToken).emit('chat message', res);

        // 回傳處理結果通知
        this.systemMessage(socket, 'chat message', 'success');
        console.log(`[chatService] user ${userID} send message ${message} to chatroom ${roomToken}`);
    };

    leaveChatroom = (socket, roomToken) => {
        const userID = socket.handshake.auth.user.id;
        console.log(`[chatService] user ${userID} ask to leave chatroom ${roomToken}`);

        // 檢查該 user 是否在該 chatroom 內
        const userJoinedRooms = [...socket.adapter.sids.get(socket.id)];
        if (!userJoinedRooms || !userJoinedRooms.includes(roomToken)) {
            this.systemMessage(socket, 'leave chatroom', 'fail');
            return;
        }

        // 離開聊天室
        socket.leave(roomToken);

        // 回傳處理結果通知
        this.systemMessage(socket, 'leave chatroom', 'success');
        console.log(`[chatService] user ${userID} leave chatroom ${roomToken}`);
    };

    disconnect = (socket, reason) => {
        const userID = socket.handshake.auth.user.id;
        console.log(`[chatService] user ${userID} disconnect with /chat websocket server because of ${reason}`);
    };
}

export default ChatService;
