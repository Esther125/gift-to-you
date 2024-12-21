import SocketService from '../services/socketService.js';
import { logWithFileInfo } from '../../logger.js';

class SocketController {
    constructor() {
        this.socketService = new SocketService();
    }

    connect = (socket) => {
        // connect to server (/socket)
        logWithFileInfo('info', '-----connect-----');

        try {
            const userID = socket.handshake.auth?.user?.id || null;
            if (userID === null) {
                this.socketService.eventWithMissingValues(socket, 'connect', { userID });
            } else {
                this.socketService.connect(socket, userID);
            }
        } catch (err) {
            logWithFileInfo('error', `Error when connecting chat websocket`, err);
        }
    };

    joinChatroom = (socket, payload) => {
        logWithFileInfo('info', '-----joinChatroom-----');
        const userID = socket.handshake.auth.user.id;

        try {
            const roomToken = payload?.roomToken || null;
            if (roomToken === null) {
                this.socketService.eventWithMissingValues(socket, 'join chatroom', { roomToken });
            } else {
                this.socketService.joinChatroom(socket, roomToken);
            }
        } catch (err) {
            logWithFileInfo('error', `Error when joining chatroom for ${userID}`, err);
            this.socketService.systemMessage(socket, 'join chatroom', 'error', 'error');
        }
    };

    requestTransfer = (socket, payload, socketNameSpace) => {
        logWithFileInfo('info', '-----requestTransfer-----');
        const userID = socket.handshake.auth.user.id;

        try {
            const fileId = payload?.fileId || null;
            const roomToken = payload?.roomToken || null;
            const receiverID = payload?.receiverID || null;
            if (fileId === null || roomToken === null) {
                this.socketService.eventWithMissingValues(socket, 'request transfer', { fileId, roomToken });
            } else {
                this.socketService.requestTransfer(socket, fileId, roomToken, receiverID, socketNameSpace);
            }
        } catch (err) {
            logWithFileInfo('error', `Error when user ${userID} request transfer`, err);
            this.socketService.systemMessage(socket, 'request transfer', 'error', 'error');
        }
    };

    chatMessage = (socket, payload) => {
        logWithFileInfo('info', '-----chatMessage-----');
        const userID = socket.handshake.auth.user.id;

        try {
            const roomToken = payload?.roomToken || null;
            const message = payload?.message || null;
            if (roomToken === null || message === null) {
                this.socketService.eventWithMissingValues(socket, 'chat message', { roomToken, message });
            } else {
                this.socketService.chatMessage(socket, roomToken, message);
            }
        } catch (err) {
            logWithFileInfo('error', `Error when user ${userID} send chat message`, err);
            this.socketService.systemMessage(socket, 'chat message', 'error', 'error');
        }
    };

    leaveChatroom = (socket, payload) => {
        logWithFileInfo('info', '-----leaveChatroom-----');
        const userID = socket.handshake.auth.user.id;

        try {
            const roomToken = payload?.roomToken || null;
            if (roomToken === null) {
                this.socketService.eventWithMissingValues(socket, 'leave chatroom', { roomToken });
            } else {
                this.socketService.leaveChatroom(socket, roomToken);
            }
        } catch (err) {
            logWithFileInfo('error', `Error when leaving chatroom for ${userID}`, err);
            this.socketService.systemMessage(socket, 'leave chatroom', 'error', 'error');
        }
    };

    disconnect = (socket, reason) => {
        logWithFileInfo('info', '-----disconnect-----');
        this.socketService.disconnect(socket, reason);
    };

    invalidEvent = (socket) => {
        logWithFileInfo('info', '-----invalid event-----');
        this.socketService.systemMessage(socket, 'invalid event', 'fail', 'invalid event');
    };
}

export default SocketController;
