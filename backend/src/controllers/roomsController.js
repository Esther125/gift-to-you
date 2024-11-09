import RedisClient from '../clients/redisClient.js';

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

    _redisTest = async (req, res) => {
        console.log('----RoomsController redisTest');

        try {
            const redis = new RedisClient();

            await redis._connect();
            await redis._set('key', 'RedisTest');
            const value = await redis._get('key');
            console.log('Redis return value: ' + value);
            await redis._setExpire('key', 10);
            redis._quit();
            res.status(200).json({ message: value });
        } catch {
            console.log('Redis Error');
            res.status(500);
        }
    };
}

export default RoomsController;
