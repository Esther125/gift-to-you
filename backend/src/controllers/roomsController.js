import RoomService from '../services/roomsService.js';

class RoomsController {
    constructor() {
        this.roomService = new RoomService();
    }

    createRoom = async (req, res) => {
        console.log('[RoomsController] -----createRoom-----');

        const user = req.body.user;

        try {
            const roomObj = await this.roomService.createRoom(user.id);
            res.status(201).json(roomObj);
        } catch {
            console.error(`[RoomsController] Error when creating room for ${user.id}`);
            res.status(500).json({ mesage: `Error when creating room for ${user.id}` });
        }
    };

    joinRoom = async (req, res) => {
        console.log('[RoomsController] -----joinRoom-----');

        const user = req.body.user;
        const token = req.params.roomToken;

        try {
            const joinRoomObj = await this.roomService.joinRoom(user.id, token);
            res.status(200).json(joinRoomObj);
        } catch {
            console.error(`[RoomsController] Error when joining room ${token} for user ${user.id}`);
            res.status(500).json({ mesage: `Error when when joining room ${token} for user ${user.id}` });
        }
    };
}

export default RoomsController;
