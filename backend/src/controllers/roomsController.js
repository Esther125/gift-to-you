import RoomService from '../services/roomsService.js'; //'../services/roomsService';

class RoomsController {
    constructor() {
        this.roomService = new RoomService();
    }

    createRoom = async (req, res) => {
        console.log('----RoomsController createRoom');
        // TODO: 實現創建房間邏輯
        const token = this.roomService._createRoom(req.body.user);
        res.status(201).json({ token: token });
    };

    joinRoom = async (req, res) => {
        console.log('----RoomsController joinRoom');
        // TODO: 實現加入房間邏輯
        res.status(200).json({ message: 'Join room logic not implemented yet' });
    };
}

export default RoomsController;
