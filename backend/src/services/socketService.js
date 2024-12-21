import redisClient from '../clients/redisClient.js';
import DynamodbService from './dynamodbService.js';
import { logWithFileInfo } from '../../logger.js';
import RoomService from './roomsService.js';
class SocketService {
    constructor() {
        this.db = new DynamodbService();
        this._roomService = new RoomService();
        this._disconnectWaitUsers = {}; // userID: roomToken
    }

    systemMessage = (socket, stage, status, content = null) => {
        // 回傳處理結果通知給 client 用
        const userID = socket.handshake.auth?.user?.id || null;
        const res = {
            event: 'system message',
            message: {
                stage,
                status,
                content,
            },
            timestamp: new Date().toISOString(),
            userID,
            roomToken: socket.roomToken || null,
        };
        socket.emit('system message', res);

        if (userID) {
            logWithFileInfo('info', `Send system message "${stage}: ${status}" to user ${userID}`);
        } else {
            logWithFileInfo(
                'error',
                `Send system message "${stage}: ${status}" to user with missing userID`,
                new Error('Missing userID')
            );
        }
    };

    eventWithMissingValues = (socket, stage, requiredValues) => {
        const userID = socket.handshake.auth?.user?.id || null;
        logWithFileInfo('info', `User ${userID} ask to ${stage} with missing values`);

        const missingValues = Object.entries(requiredValues)
            .filter(([key, value]) => value === null)
            .map(([key, value]) => key);
        const msg = `${missingValues.join(', ')} required`;
        this.systemMessage(socket, stage, 'fail', msg);
    };

    connect = async (socket, userID) => {
        logWithFileInfo('info', `User ${userID} ask to connect to /socket websocket server`);

        // 加入以 userID 命名的聊天室
        socket.join(userID);

        // 判斷以前是不是有加入過房間了
        try {
            await redisClient.connect();
            const roomToken = await redisClient.get(`userId:${userID}`);
            if (roomToken !== null && this._checkUserInRoom(socket, userID, roomToken) === false) {
                logWithFileInfo('info', `Add user ${userID} back to room ${roomToken}`);
                this.joinChatroom(socket, roomToken);
            }
        } catch (err) {
            logWithFileInfo('error', `Error when add user ${userID} back to original room`, err);
        }

        // 移出等待清單
        const roomToken = this._disconnectWaitUsers[userID];
        if (roomToken !== undefined) {
            logWithFileInfo('info', `Remove user: ${userID} + room: ${roomToken} from waiting list since reconnect`);
            delete this._disconnectWaitUsers[userID];
        }

        // 回傳處理結果通知
        this.systemMessage(socket, 'connect', 'success', 'success');
        logWithFileInfo('info', `User ${userID} connect to /socket websocket server`);
    };

    _checkUserInRoom = (socket, userID, roomToken) => {
        let memberSockets;
        let userSockets;
        try {
            memberSockets = [...socket.adapter.rooms.get(roomToken)];
            userSockets = [...socket.adapter.rooms.get(userID)];
        } catch {
            return false;
        }

        let inRoom = false;
        userSockets.forEach((userSocket) => {
            if (memberSockets.includes(userSocket)) {
                inRoom = true;
                return;
            }
        });

        return inRoom;
    };

    _sendRoomNotify = (socket, roomToken, userID, type) => {
        const res = {
            event: 'room notify',
            roomToken,
            userID,
            type,
            timestamp: new Date().toISOString(),
        };
        socket.to(roomToken).emit('room notify', res);
    };

    joinChatroom = (socket, roomToken) => {
        const userID = socket.handshake.auth.user.id;
        logWithFileInfo('info', `User ${userID} ask to join chatroom ${roomToken}`);

        const roomExist = true; // TODO: 之後再看怎麼接 roomService 來判斷

        if (roomExist) {
            // 加入聊天室
            socket.join(roomToken);
            socket.roomToken = roomToken;

            // 通知 room 內其他人
            this._sendRoomNotify(socket, roomToken, userID, 'join');

            // 回傳處理結果通知
            this.systemMessage(socket, 'join chatroom', 'success', 'success');
            logWithFileInfo('info', `User ${userID} join chatroom ${roomToken}`);
        } else {
            // 回傳處理結果通知
            this.systemMessage(socket, 'join chatroom', 'fail');
            logWithFileInfo(
                'error',
                `User ${userID} can not join non-existed room ${roomToken}`,
                new Error('User can not join non-existed room')
            );
        }
    };

    requestTransfer = (socket, fileId, roomToken, receiverID, socketNameSpace) => {
        const userID = socket.handshake.auth.user.id;
        const senderID = userID;
        const res = {
            event: 'transfer notify',
            fileId: fileId,
            roomToken,
            senderID,
            timestamp: new Date().toISOString(),
        };

        // 檢查 sender 是否在該 chatroom 內
        const senderInRoom = this._checkUserInRoom(socket, senderID, roomToken);
        if (!senderInRoom) {
            this.systemMessage(socket, 'request transfer', 'fail', `sender not in room ${roomToken}`);
            logWithFileInfo('error', `Sender ${userID} is not in room ${roomToken}`, new Error('Sender not in room'));
            return;
        }

        if (receiverID) {
            // 傳輸對象: user
            logWithFileInfo('info', `User ${userID} ask to transfer file to user ${receiverID}`);

            // 檢查 receiver 是否在該 chatroom 內
            const receiverInRoom = this._checkUserInRoom(socket, receiverID, roomToken);
            if (!receiverInRoom) {
                this.systemMessage(socket, 'request transfer', 'fail', `receiver not in room ${roomToken}`);
                logWithFileInfo(
                    'error',
                    `Receiver ${userID} is not in room ${roomToken}`,
                    new Error('Receiver not in room')
                );
                return;
            }

            // 檢查 sender、receiver 是否相同
            if (senderID === receiverID) {
                this.systemMessage(socket, 'request transfer', 'fail', `sender and receiver are the same`);
                logWithFileInfo(
                    'error',
                    `User ${userID} ask to transfer to himself`,
                    new Error('Cannot transfer to himself')
                );
                return;
            }

            // 通知 receiver，sender 要傳檔案給他
            socketNameSpace.to(receiverID).emit('transfer notify', res);
            logWithFileInfo('info', `Send transfer notification requested from user ${senderID} to user ${receiverID}`);
        } else {
            // 傳輸對象: room
            logWithFileInfo('info', `User ${userID} ask to transfer file to room ${roomToken}`);

            // 通知 chatroom 中的所有 user，sender 要傳檔案給他
            socket.to(roomToken).emit('transfer notify', res);
            logWithFileInfo('info', `Send transfer notification requested from user ${senderID} to room ${roomToken}`);
        }

        // 回傳處理結果通知
        this.systemMessage(socket, 'request transfer', 'success', 'success');
    };

    chatMessage = (socket, roomToken, message) => {
        const userID = socket.handshake.auth.user.id;
        logWithFileInfo('info', `User ${userID} ask to send message to chatroom ${roomToken}`);

        // 檢查該 user 是否在該 chatroom 內
        const inRoom = this._checkUserInRoom(socket, userID, roomToken);
        if (!inRoom) {
            this.systemMessage(socket, 'chat message', 'fail', `sender not in room ${roomToken}`);
            logWithFileInfo('error', `User ${userID} is not in room ${roomToken}`, new Error('User not in room'));
            return;
        }

        // 將訊息發給 chatroom 中的所有 user
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
        this.systemMessage(socket, 'chat message', 'success', 'success');
        logWithFileInfo('info', `User ${userID} send message ${message} to chatroom ${roomToken}`);
    };

    leaveChatroom = (socket, roomToken) => {
        const userID = socket.handshake.auth.user.id;
        logWithFileInfo('info', `User ${userID} ask to leave chatroom ${roomToken}`);

        // 檢查該 user 是否在該 chatroom 內
        const inRoom = this._checkUserInRoom(socket, userID, roomToken);
        if (!inRoom) {
            this.systemMessage(socket, 'leave chatroom', 'fail', `user not in room ${roomToken}`);
            logWithFileInfo('error', `User ${userID} is not in room ${roomToken}`, new Error('User not in room'));
            return;
        }

        // 離開聊天室
        socket.leave(roomToken);

        // 通知 room 內其他人
        this._sendRoomNotify(socket, roomToken, userID, 'leave');

        // 回傳處理結果通知
        this.systemMessage(socket, 'leave chatroom', 'success', 'success');
        logWithFileInfo('info', `User ${userID} leave chatroom ${roomToken}`);
    };

    disconnect = async (socket, reason) => {
        const userID = socket.handshake.auth?.user?.id || null;
        if (userID) {
            logWithFileInfo('info', `User ${userID} disconnect with /chat websocket server because of ${reason}`);
            const roomToken = socket.roomToken;
            if (roomToken !== undefined) {
                // 通知 room 內其他人
                this._sendRoomNotify(socket, roomToken, userID, 'leave');

                // 加入等待清單
                logWithFileInfo('info', `Put user: ${userID} + room: ${roomToken} in waiting list`);
                if (this._disconnectWaitUsers[userID] === undefined) {
                    this._disconnectWaitUsers[userID] = [roomToken];
                } else {
                    this._disconnectWaitUsers[userID].push(roomToken);
                }
                this._setupExpireTimer(socket, userID, roomToken);
            }
            socket.leave(userID);
        } else {
            logWithFileInfo(
                'info',
                `User with missing userID disconnect with /socket websocket server because of ${reason}`
            );
        }
    };

    _setupExpireTimer = (socket, userID, roomToken) => {
        // 設定 timer
        setTimeout(async () => {
            if (this._disconnectWaitUsers[userID] !== undefined) {
                try {
                    // 清除 redis 紀錄
                    await this._roomService.leaveTargetRoom(userID, roomToken);
                    logWithFileInfo(
                        'info',
                        `Remove user: ${userID} + room: ${roomToken} from waiting list since time's up`
                    );

                    // 再通知房間成員
                    this._sendRoomNotify(socket, roomToken, userID, 'leave');
                } catch (err) {
                    logWithFileInfo('error', 'Error in removing userId in redis', err);
                }
            }
        }, 5000);
    };
}

export default SocketService;
