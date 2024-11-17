import NotifyController from '../controllers/notifyController.js';

const VALID_EVENTS = ['request transfer'];

const notifyRouter = (notifyNameSpace) => {
    const notifyController = new NotifyController();

    // connect to server (/notify)
    notifyNameSpace.on('connection', (socket) => {
        notifyController.connect(socket);

        socket.on('request transfer', (payload) => {
            // request transfer
            notifyController.requestTransfer(socket, payload, notifyNameSpace);
        });

        socket.on('disconnect', (reason) => {
            // disconnect with server (/notify)
            notifyController.disconnect(socket, reason);
        });

        socket.on('error', (e) => {
            // error
            console.log(`Error in websocket for notify: ${e}`);
        });

        socket.onAny((event) => {
            // invalid events
            if (VALID_EVENTS.includes(event)) {
                return;
            }
            notifyController.invalidEvent(socket);
        });
    });
};

export default notifyRouter;
