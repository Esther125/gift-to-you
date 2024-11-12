import { Router } from 'express';
import InternetFileController from '../controllers/internetFileController.js';

const internetFileRouter = Router();
const internetFileController = new InternetFileController();

// 定義路由
internetFileRouter.post('/upload', internetFileController.upload);
internetFileRouter.get('/download/:blob_name', internetFileController.download);

export default internetFileRouter;
