import AuthService from '../services/authService.js';
class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    register = async (req, res) => {
        console.log('[AuthController] -----register-----');
        let userID, email, password, userName;
        try {
            userID = req.body.userID;
            if (!userID) {
                res.status(400).json({ message: 'UserID is required' });
                return;
            }
            email = req.body.email;
            if (!email) {
                res.status(400).json({ message: 'Email is required' });
                return;
            }
            password = req.body.password;
            if (!password) {
                res.status(400).json({ message: 'Password is required' });
                return;
            }
            userName = req.body.userName;
            if (!userName) {
                res.status(400).json({ message: 'UserName is required' });
                return;
            }
            const userInfo = await this.authService.register(userID, email, password, userName);

            if (userInfo.create) {
                res.status(201).json({ message: 'Register success', data: userInfo.data });
            } else {
                res.status(200).json({ message: 'User already registered', data: userInfo.data });
            }
        } catch {
            console.error(`[AuthController] error when ${email} try to register`);
            res.status(500).json({ message: `Error when ${email} try to register` });
        }
    };

    login = async (req, res) => {
        console.log('[AuthController] -----login-----');
        let email, password;
        try {
            email = req.body.email;
            if (!email) {
                res.status(400).json({ message: 'Email is required' });
                return;
            }
            password = req.body.password;
            if (!password) {
                res.status(400).json({ message: 'Password is required' });
                return;
            }

            const loginResult = await this.authService.login(email, password);
            if (loginResult.success) {
                res.status(200).json({ message: 'Login success', data: loginResult.data });
            } else {
                res.status(401).json({ message: loginResult.error });
            }
        } catch {
            console.error(`[AuthController] error when ${email} try to login`);
            res.status(500).json({ message: `Error when ${email} try to login` });
        }
    };

    logout = async (req, res) => {
        console.log('[AuthController] -----logout-----');
        // TODO: 實現登出邏輯
        res.status(200).json({ message: 'Logout logic not implemented yet' });
    };
}

export default AuthController;
