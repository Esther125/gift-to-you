import { Router } from 'express';
import InternetFileController from '../controllers/internetFileController.js';
import InternetFileService from '../services/internetFileService.js'; // 确保从正确的位置导入

const internetFileRouter = Router();
const internetFileController = new InternetFileController();
const internetFileService = new InternetFileService();

// 定義路由
internetFileRouter.post('/upload', internetFileService.getUploadMiddleware(), internetFileController.upload);
internetFileRouter.get('/:userId/download/:way/:fileId', internetFileController.download);
internetFileRouter.delete('/delete/:fileId', internetFileController.deleteFile);

export default internetFileRouter;
