import { WebSocketServer } from 'ws';

class wsServer extends WebSocketServer {
    constructor(options) {
        super(options);
        // TODO: 儲存 chatroom 的方式
        // -----
        // Demo: 在 server 中存成 object
        // chatroom 可以是一對一、一對多的，統稱 chatroom
        // chatrooms 格式: {chatroomID: [ws1, ws2, ...], ...}
        this.chatrooms = {};
        // -----
    }

    joinChatroom(ws, chatroomID) {
        // TODO: 儲存 chatroom 的方式
        // -----
        // Demo: 在 server 中存成 object
        // 將 ws 加入該 chatroom 中
        if (!this.chatrooms[chatroomID]) {
            this.chatrooms[chatroomID] = [ws];
        } else {
            this.chatrooms[chatroomID].push(ws);
        }
        console.log(`[websocket] Join chatroom ${chatroomID}`);
        // -----
    }

    leaveChatroom(ws, chatroomID) {
        // TODO: 儲存 chatroom 的方式
        // -----
        // Demo: 在 server 中存成 object
        // 將 ws 移出該 chatroom 中
        const pos = this.chatrooms[chatroomID].indexOf(ws);
        this.chatrooms[chatroomID].splice(pos, 1);
        if (this.chatrooms[chatroomID].length === 0) {
            delete this.chatrooms[chatroomID];
        }
        console.log(`[websocket] Leave chatroom ${chatroomID}`);
        // -----
    }

    wsMessage(ws, chatroomID, message) {
        // TODO: server 收到 message 後的處理
        // -----
        // Demo: 發送 message 給同一個 chatroom 中的其他 client
        this.chatrooms[chatroomID].forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
        console.log(`[websocket] Receive and send message in chatroom ${chatroomID}`);
        // -----
    }

    wsClose(ws, chatroomID) {
        // TODO: websocket 關閉後的處理
        // -----
        // Demo: 將 ws 移出該 chatroom
        this.leaveChatroom(ws, chatroomID);
        // -----
    }

    socket(ws, req) {
        const paths = req.url.split('/').filter((path) => !!path);
        const pos = paths.indexOf('chatrooms');
        if (pos >= 0) {
            const chatroomID = paths[pos + 1];
            this.joinChatroom(ws, chatroomID);

            ws.on('error', console.error);

            ws.on('message', (message) => {
                this.wsMessage(ws, chatroomID, message);
            });

            ws.on('close', () => {
                this.wsClose(ws, chatroomID);
            });
        }
    }
}

export default wsServer;
