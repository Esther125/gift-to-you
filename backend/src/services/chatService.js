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

    joinChatroom = (socket, chatroomName) => {
        const userID = socket.handshake.auth.user.id;
        console.log(`[chatService] user ${userID} ask to join chatroom ${chatroomName}`);
        
        // chatroomName 結構: {senderID}_{receiverID}
        const [senderID, receiverID] = chatroomName.split('_');
        const allRooms = [...socket.adapter.rooms.keys()];
        
        if (senderID === receiverID) {
            // 檢查是否為 sender、receiver 是否相同
            this.systemMessage(socket, 'join chatroom', 'fail');
            return;
        }
        if (!allRooms || !allRooms.includes(senderID) || !allRooms.includes(receiverID)) {
            // 檢查 sender、receiver 是否存在
            this.systemMessage(socket, 'join chatroom', 'fail');
            return;
        }
        if (userID !== senderID && userID !== receiverID) {
            // 檢查該 user 是否為傳輸雙方之一
            this.systemMessage(socket, 'join chatroom', 'fail');
            return;
        }
        
        // 加入兩人的聊天室
        socket.join(chatroomName);
        
        // 回傳處理結果通知
        this.systemMessage(socket, 'join chatroom', 'success');
        console.log(`[chatService] user ${userID} join chatroom ${chatroomName}`);
    };
    
    chatMessage = (socket, chatroomName, message) => {
        const userID = socket.handshake.auth.user.id;
        console.log(`[chatService] user ${userID} ask to send message to chatroom ${chatroomName}`);

        // 檢查該 user 是否在該 chatroom 內
        const userJoinedRooms = [...socket.adapter.sids.get(socket.id)];
        if (!userJoinedRooms || !userJoinedRooms.includes(chatroomName)) {
            this.systemMessage(socket, 'chat message', 'fail');
            return;
        }

        // 將訊息發給 chatroom 中的對方
        const res = {
            event: 'chat message',
            chatroomName,
            message,
            timestamp: new Date().toISOString(),
        };
        socket.to(chatroomName).emit('chat message', res);

        // 回傳處理結果通知
        this.systemMessage(socket, 'chat message', 'success');
        console.log(`[chatService] user ${userID} send message ${message} to chatroom ${chatroomName}`);
    };

    disconnect = (socket, reason) => {
        const userID = socket.handshake.auth.user.id;
        console.log(`[chatService] user ${userID} disconnect with /chat websocket server because of ${reason}`);
    };
}

export default ChatService;
