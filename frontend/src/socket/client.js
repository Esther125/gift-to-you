class wsClient {
    constructor(messageBox) {
        this.ws = null;
        this.chatroomID = null;
        this.messageBox = messageBox; // 呈現 message 的地方
    }

    showMessage(message) {
        // TODO: 呈現 message 的方式
        // -----
        // Demo:
        this.messageBox.textContent += `\n${message}`;
        this.messageBox.scrollTop = this.messageBox.scrollHeight;
        // -----
    }

    async joinChatroom(newChatroomID) {
        if (!newChatroomID) {
            return;
        }
        if (newChatroomID == this.chatroomID) {
            return;
        }

        await this.leaveChatroom();
        this.chatroomID = newChatroomID;

        // TODO: 加入 chatroom 到建立 ws 連線前的處理

        this.initConnection();
    }

    leaveChatroom() {
        if (!this.ws) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const handleClose = () => {
                if (this.chatroomID) {
                    // TODO: 離開 chatroom 後的處理
                    // -----
                    // Demo:
                    this.showMessage(`(Leave chatroom ${this.chatroomID})`);
                    // -----

                    this.chatroomID = null;
                }

                this.ws = null;
                resolve();
            };

            this.ws.onclose = handleClose;
            this.ws.close();
        });
    }

    wsOpen() {
        // TODO: 建立好 ws 連線後的處理
        // -----
        // Demo:
        this.showMessage(`(Join chatroom ${this.chatroomID})`);
        // -----
    }

    wsMessage(message) {
        // TODO: 收到 message 後的處理
        // -----
        // Demo:
        this.showMessage(`Received: ${message.data}\n${new Date().toLocaleString()}`);
        // -----
    }

    async initConnection() {
        if (!this.chatroomID) {
            return;
        }

        const WS_SERVER_HOST = "localhost";
        const WS_SERVER_PORT = 3000;
        this.ws = new WebSocket(`ws://${WS_SERVER_HOST}:${WS_SERVER_PORT}/chatrooms/${this.chatroomID}`);
        console.log(this.ws);

        this.ws.onerror = console.error;

        this.ws.onopen = () => {
            this.wsOpen();
        };

        this.ws.onmessage = (message) => {
            this.wsMessage(message);
        };

        this.ws.onclose = async () => {
            await this.leaveChatroom();
        };
    }
}

export default wsClient;
