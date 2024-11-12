import { Router } from 'express';
import HomeController from '../controllers/homeController.js';

const homeRouter = Router();
const homeController = new HomeController();

// 定義路由
homeRouter.get('/', homeController.index);

export default homeRouter;
