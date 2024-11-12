import { Router } from 'express';
import AuthController from '../controllers/authController.js'; 

const authRouter = Router();
const authController = new AuthController(); 

// 定義路由
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);

export default authRouter; 
