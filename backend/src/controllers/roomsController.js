class RoomsController {
    async createRoom(req, res) {
        console.log('----RoomsController.createRoom');
        // TODO: 實現創建房間邏輯
        res.status(201).json({ message: 'Create room logic not implemented yet' });
    }

    async joinRoom(req, res) {
        console.log('----RoomsController.joinRoom');
        // TODO: 實現加入房間邏輯
        res.status(200).json({ message: 'Join room logic not implemented yet' });
    }
}

export default RoomsController;
