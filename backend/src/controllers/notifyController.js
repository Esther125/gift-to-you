import NotifyService from '../services/notifyService.js';

class NotifyController {
    constructor() {
        this.notifyService = new NotifyService();
    }

    connect = (socket) => {
        // connect to server (/notify)
        console.log('[notifyController] -----connect-----');

        try {
            const userID = socket.handshake.auth.user.id;
            this.notifyService.connect(socket, userID);
        } catch {
            console.error(`[notifyController] Error when connecting notify websocket`);
        }
    };

    requestTransfer = (socket, payload, notifyNameSpace) => {
        console.log('[notifyController] -----requestTransfer-----');
        const userID = socket.handshake.auth.user.id;

        try {
            const receiverID = payload.receiverID;
            this.notifyService.requestTransfer(socket, receiverID, notifyNameSpace);
        } catch {
            console.error(`[notifyController] Error when user ${userID} request transfer`);
            this.notifyService.systemMessage(socket, 'request transfer', 'error');
        }
    };

    disconnect = (socket, reason) => {
        console.log('[notifyController] -----disconnect-----');
        this.notifyService.disconnect(socket, reason);
    };

    invalidEvent = (socket) => {
        console.log('[notifyController] -----invalid event-----');
        this.notifyService.systemMessage(socket, 'invalid event', 'fail');
    };
}

export default NotifyController;
