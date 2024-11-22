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

    _checkUserInRoom = (socket, userID, roomToken) => {
        let memberSockets;
        try {
            memberSockets = [...socket.adapter.rooms.get(roomToken)];
        } catch {
            return false;
        }

        let userSocket;
        try {
            userSocket = [...socket.adapter.rooms.get(userID)][0];
        } catch {
            return false;
        }

        if (!memberSockets.includes(userSocket)) {
            return false;
        }
        return true;
    };

    requestTransfer = (socket, roomToken, receiverID, chatNameSpace) => {
        const userID = socket.handshake.auth.user.id;
        const senderID = userID;
        console.log(`[chatService] user ${userID} ask to transfer file to user ${receiverID}`);

        // 檢查 sender 和 receiver 是否在該 chatroom 內
        const senderInRoom = this._checkUserInRoom(socket, senderID, roomToken);
        const receiverInRoom = this._checkUserInRoom(socket, receiverID, roomToken);
        if (!senderInRoom || !receiverInRoom) {
            console.log('here1');
            this.systemMessage(socket, 'request transfer', 'fail');
            return;
        }

        if (senderID === receiverID) {
            // 檢查 sender、receiver 是否相同
            this.systemMessage(socket, 'request transfer', 'fail');
            return;
        }

        // 通知 receiver，sender 要傳檔案給他
        const res = {
            event: 'transfer notify',
            roomToken,
            senderID,
            timestamp: new Date().toISOString(),
        };
        chatNameSpace.to(receiverID).emit('transfer notify', res);
        console.log(`[chatService] send transfer notification requested from user ${senderID} to user ${receiverID}`);

        // 回傳處理結果通知
        this.systemMessage(socket, 'request transfer', 'success');
    };

    chatMessage = (socket, roomToken, message) => {
        const userID = socket.handshake.auth.user.id;
        console.log(`[chatService] user ${userID} ask to send message to chatroom ${roomToken}`);

        // 檢查該 user 是否在該 chatroom 內
        const inRoom = this._checkUserInRoom(socket, userID, roomToken);
        if (!inRoom) {
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
        const inRoom = this._checkUserInRoom(socket, userID, roomToken);
        if (!inRoom) {
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
