import crypto from 'crypto';
import redisClient from '../clients/redisClient.js';
import QRCode from 'qrcode';
import { logWithFileInfo } from '../../logger.js';
import DynamodbService from './dynamodbService.js';

class RoomService {
    constructor() {
        this._dynamodbService = new DynamodbService();
    }

    _createToken = () => {
        let token = '';

        const charArr = new Uint8Array(5);
        crypto.getRandomValues(charArr);

        charArr.forEach((c) => {
            let code = Math.abs((c - 65) % 26) + 65;
            token += String.fromCharCode(code);
        });

        return token;
    };

    createRoom = async (userId) => {
        logWithFileInfo('info', `CreateRoom called with userId: ${userId}`);

        await redisClient.connect();

        // 1. check whether user has been in a room or not
        let token = await redisClient.get(`userId:${userId}`);
        let members;
        if (token !== null) {
            logWithFileInfo('info', `User ${userId} has already in the room ${token}`);
            members = await redisClient.sGet(token);
            return { token, members };
        }

        // 2. create room token
        token = this._createToken();
        // make sure the token is unique
        members = await redisClient.sGet(token);
        while (members.length !== 0) {
            logWithFileInfo('info', 'Token collision detected. Generating a new token');
            token = this._createToken();
            members = await redisClient.sGet(token);
        }
        members = [userId];

        // 3. add user to redis
        await redisClient.sAdd(token, userId);
        await redisClient.set(`userId:${userId}`, token);
        await redisClient.setExpire(token, 8 * 3600);
        await redisClient.setExpire(`userId:${userId}`, 8 * 3600);
        await this._saveUsername(userId);

        logWithFileInfo('info', `Room created successfully with token: ${token}`);
        return { token, members };
    };

    joinRoom = async (userId, token) => {
        logWithFileInfo('info', 'JoinRoom called with userId:', userId, 'and token:', token);

        await redisClient.connect();

        const inTargetRoom = await this._leaveRoom(userId, token);
        let message;
        let members;
        let memberNamePairs;

        if (inTargetRoom) {
            message = `already in target room ${token}`;
            members = await redisClient.sGet(token);
            logWithFileInfo('info', `User ${userId} have already in target room ${token}`);
            return { message, members };
        }

        const roomExist = await redisClient.sExist(token);
        if (!roomExist) {
            message = `room ${token} has not been created`;
            logWithFileInfo('info', `Room ${token} has not been created`);
            return { message, members: [] };
        }

        // add userId to room in redis
        await redisClient.sAdd(token, userId);

        // add userId and roomToken info in redis
        await redisClient.set(`userId:${userId}`, token);
        await redisClient.setExpire(`userId:${userId}`, 8 * 3600);

        // add userId and username info in redis
        await this._saveUsername(userId);

        message = `join target room ${token} successfully`;

        members = await redisClient.sGet(token);
        memberNamePairs = await this.getNamePairs(members);

        logWithFileInfo('info', `User ${userId} have join the room ${token}`);

        return { message, members, namePairs: memberNamePairs };
    };

    _leaveRoom = async (userId, token) => {
        /**
         * judge user in target room or not
         * if not, leave origin room
         *
         * return true: if user in target room
         * return false: if user not in target room
         */

        logWithFileInfo('info', `Check User ${userId} in target room or not`);

        // 1. Check user is in room or not
        const tokenFromRedis = await redisClient.get(`userId:${userId}`);
        if (tokenFromRedis === token) {
            // have already in the target room
            logWithFileInfo('info', `User ${userId} has already in the room ${token}`);
            return true;
        } else if (tokenFromRedis === null) {
            // not in any room now
            logWithFileInfo('info', `User ${userId} is not in any room now`);
            return false;
        }

        // 2. Leave room
        await redisClient.sRem(tokenFromRedis, userId);
        await redisClient.del(`userId:${userId}`);

        logWithFileInfo('info', `User ${userId} have leave the room ${tokenFromRedis}`);

        return false;
    };

    _saveUsername = async (userId) => {
        let { username } = await redisClient.hGetAll(`userId:${userId}:username`);
        if (username === undefined) {
            username = await this._dynamodbService.getUserNameFromID(userId);
            if (username === null) {
                logWithFileInfo('info', `save no username for user ${userId} in redis`);
                await redisClient.hSet(`userId:${userId}:username`, { hasData: 'false' });
            } else {
                logWithFileInfo('info', `save username ${username} for user ${userId} in redis`);
                await redisClient.hSet(`userId:${userId}:username`, { hasData: 'true', username });
            }
        } else {
            logWithFileInfo('info', `username ${username} for user ${userId} already saved in redis`);
        }
        await redisClient.setExpire(`userId:${userId}:username`, 8 * 3600);
    };

    createQRCode = async (url) => {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(url);
            logWithFileInfo('info', 'QrCode create success');
            return qrCodeDataUrl;
        } catch (err) {
            logWithFileInfo('error', 'QrCode create error: ', err);
            return null;
        }
    };

    getMembers = async (token) => {
        try {
            await redisClient.connect();
            let members = await redisClient.sGet(token);
            return members;
        } catch (err) {}
    };

    getNamePairs = async (members) => {
        try {
            await redisClient.connect();
            let memberNamePairs = {};
            for (const memberId of members) {
                const { hasData, username } = await redisClient.hGetAll(`userId:${memberId}:username`);
                if (hasData === 'true') {
                    memberNamePairs[memberId] = username;
                }
            }
            return memberNamePairs;
        } catch (err) {}
    };

    leaveTargetRoom = async (userId, token) => {
        await redisClient.connect();

        const tokenFromRedis = await redisClient.get(`userId:${userId}`);
        if (tokenFromRedis === token) {
            await redisClient.sRem(token, userId);
            await redisClient.del(`userId:${userId}`);

            logWithFileInfo('info', `Leave target room: ${userId} and token ${token}`);
        }
    };
}

export default RoomService;
