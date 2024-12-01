import { Router } from 'express';
import InternetFileController from '../controllers/internetFileController.js';

const internetFileRouter = Router();
const internetFileController = new InternetFileController();

// 定義路由
internetFileRouter.post('/upload', internetFileController.upload);
internetFileRouter.post('/send', internetFileController.send);
internetFileRouter.get('/download/:way/:fileId', internetFileController.download);

export default internetFileRouter;
