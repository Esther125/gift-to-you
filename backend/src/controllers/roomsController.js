import RoomService from '../services/roomsService.js';
import { logWithFileInfo } from '../../logger.js';

class RoomsController {
    constructor() {
        this.roomService = new RoomService();
    }

    createRoom = async (req, res) => {
        logWithFileInfo('info', '-----createRoom-----');

        let user;
        try {
            user = req.body.user;
            if (!user) {
                logWithFileInfo(
                    'error',
                    'Error when creating room - User object is required',
                    new Error('Argument is needed but missing')
                );
                return res.status(400).json({ message: 'User object is required' });
            }

            if (!user.id || user.id.length === 0) {
                logWithFileInfo(
                    'error',
                    'Error when creating room - User id is required',
                    new Error('Argument is needed but missing')
                );
                return res.status(400).json({ message: 'User id is required' });
            }

            const roomObj = await this.roomService.createRoom(user.id);
            const joinRoomUrl = `${process.env.FRONTEND_BASE_URL}/?roomToken=${roomObj.token}`;
            const qrCodeDataUrl = await this.roomService.createQRCode(joinRoomUrl);
            res.status(201).json({ token: roomObj.token, members: roomObj.members, qrCodeDataUrl });
        } catch (err) {
            logWithFileInfo('error', `Error when creating room for ${user.id}`, err);
            res.status(500).json({ message: `Error when creating room for ${user.id}` });
        }
    };

    joinRoom = async (req, res) => {
        logWithFileInfo('info', '-----joinRoom-----');

        let user;
        let token;
        try {
            user = req.body.user;
            token = req.params.roomToken;

            if (!user) {
                logWithFileInfo(
                    'error',
                    'Error when joining room - User object is required',
                    new Error('Argument is needed but missing')
                );
                return res.status(400).json({ message: 'User object is required' });
            }

            if (!user.id || user.id.length === 0) {
                logWithFileInfo(
                    'error',
                    'Error when joining room - User id is required',
                    new Error('Argument is needed but missing')
                );
                return res.status(400).json({ message: 'User id is required' });
            }

            const joinRoomObj = await this.roomService.joinRoom(user.id, token);
            if (joinRoomObj.members.length !== 0) {
                const joinRoomUrl = `${process.env.FRONTEND_BASE_URL}/?roomToken=${token}`;
                const qrCodeDataUrl = await this.roomService.createQRCode(joinRoomUrl);
                return res
                    .status(200)
                    .json({ message: joinRoomObj.message, members: joinRoomObj.members, qrCodeDataUrl });
            }

            return res.status(200).json({ message: joinRoomObj.message, members: joinRoomObj.members });
        } catch (err) {
            logWithFileInfo('error', `Error when joining room ${token} for user ${user.id}`, err);
            res.status(500).json({ message: `Error when when joining room ${token} for user ${user.id}` });
        }
    };

    getMembers = async (req, res) => {
        logWithFileInfo('info', '-----getMembers-----');

        let token;
        try {
            token = req.params.roomToken;
            if (token) {
                const members = await this.roomService.getMembers(token);
                return res.status(200).json(members);
            }
            return res.status(400).json({ message: 'RoomToken is required' });
        } catch (err) {
            logWithFileInfo('error', `Error when getting members of room ${token}`, err);
            res.status(500).json({ message: `Error when getting members of room ${token}` });
        }
    };

    leaveTargetRoom = async (req, res) => {
        logWithFileInfo('info', '-----leaveTargetRoom-----');

        let user;
        let token;
        try {
            user = req.body.user;
            token = req.params.roomToken;

            if (!user) {
                logWithFileInfo(
                    'error',
                    'Error when leaving room - User object is required',
                    new Error('Argument is needed but missing')
                );
                return res.status(400).json({ message: 'User object is required' });
            }

            if (!user.id || user.id.length === 0) {
                logWithFileInfo(
                    'error',
                    'Error when leaving room - User id is required',
                    new Error('Argument is needed but missing')
                );
                return res.status(400).json({ message: 'User id is required' });
            }

            await this.roomService.leaveTargetRoom(user.id, token);

            return res.status(200).json({ message: 'success' });
        } catch (err) {
            logWithFileInfo('error', `Error when leaving room ${token} for user ${user.id}`, err);
            res.status(500).json({ message: `Error when when leaving room ${token} for user ${user.id}` });
        }
    };
}

export default RoomsController;
