import { Router } from 'express';
import InternetFileController from '../controllers/internetFileController.js';

const internetFileRouter = Router();
const internetFileController = new InternetFileController();

// 定義路由
internetFileRouter.post('/upload', internetFileController.upload);
internetFileRouter.get('/download/:way/:fileId', internetFileController.download);
internetFileRouter.delete('/delete/:fileId', internetFileController.deleteFile);

export default internetFileRouter;
