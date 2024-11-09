import { Router } from 'express';
import RoomsController from '../controllers/roomsController.js';

const roomsRouter = Router();
const roomsController = new RoomsController();

roomsRouter.post('/rooms', roomsController.createRoom);
roomsRouter.post('/rooms/:roomId/join', roomsController.joinRoom);
roomsRouter.get('/rooms/redisTest', roomsController._redisTest);

export default roomsRouter;
