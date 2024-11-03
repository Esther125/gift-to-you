class AuthController {
    async register(req, res) {
        console.log('----AuthController.register');
        // TODO: 實現註冊邏輯
        res.status(201).json({ message: 'User registered logic not implemented yet' });
    }

    async login(req, res) {
        console.log('----AuthController.login');
        // TODO: 實現登錄邏輯
        res.status(200).json({ message: 'Login logic not implemented yet' });
    }
}

export default AuthController;
