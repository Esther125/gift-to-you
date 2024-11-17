class NotifyService {
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
        console.log(`[notifyService] send system message "${stage}: ${status}" to user ${userID}`);
    };

    connect = (socket, userID) => {
        console.log(`[notifyService] user ${userID} ask to connect to /notify websocket server`);

        // 加入以 userID 命名的聊天室
        socket.join(userID);

        // 回傳處理結果通知
        this.systemMessage(socket, 'connect', 'success');
        console.log(`[notifyService] user ${userID} connect to /notify websocket server`);
    };

    requestTransfer = (socket, receiverID, notifyNameSpace) => {
        const userID = socket.handshake.auth.user.id;
        const senderID = userID;
        console.log(`[notifyService] user ${userID} ask to transfer file to user ${receiverID}`);

        const allRooms = [...socket.adapter.rooms.keys()];

        if (senderID === receiverID) {
            // 檢查是否為 sender、receiver 是否相同
            this.systemMessage(socket, 'request transfer', 'fail');
            return;
        }
        if (!allRooms.includes(receiverID)) {
            // 檢查 receiver 是否存在
            this.systemMessage(socket, 'request transfer', 'fail');
            return;
        }

        // 通知 receiver，sender 要傳檔案給他
        this._sendTransferNotify(notifyNameSpace, senderID, receiverID);

        // 回傳處理結果通知
        this.systemMessage(socket, 'request transfer', 'success');
    };

    _sendTransferNotify = (notifyNameSpace, senderID, receiverID) => {
        const res = {
            event: 'transfer notify',
            senderID,
            timestamp: new Date().toISOString(),
        };
        notifyNameSpace.to(receiverID).emit('transfer notify', res);
        console.log(`[notifyService] send transfer notification requested from user ${senderID} to user ${receiverID}`);
    };

    disconnect = (socket, reason) => {
        const userID = socket.handshake.auth.user.id;
        console.log(`[notifyService] user ${userID} disconnect with /notify websocket server because of ${reason}`);
    };
}

export default NotifyService;
