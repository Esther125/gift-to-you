import { userInfo } from 'os';
import DynamodbService from './dynamodbService.js';
import crypto from 'crypto';

class AuthService {
    constructor() {
        this._dynamodbService = new DynamodbService();
    }

    _hashPassword = (password, passwordSalt) => {
        return crypto.pbkdf2Sync(password, passwordSalt, 1000, 64, 'sha512').toString('hex');
    };

    _getUserIDFromLabel = (label) => {
        return label.split('#')[1];
    };

    _hidePasswordInfo = (userInfo) => {
        return {
            userID: this._getUserIDFromLabel(userInfo.pk),
            email: userInfo.email,
            userName: userInfo.userName,
        };
    };

    register = async (userID, email, password, userName) => {
        console.log(`[AuthService] ${email} try to register`);

        // check registered or not
        let create;
        let userInfo = await this._dynamodbService.getUserInfoFromEmail(email);

        if (userInfo !== null) {
            // registered
            console.log(`[AuthService] ${email} already registered`);
            create = false;
        } else {
            // not yet registered
            console.log(`[AuthService] ${email} not registered yet`);
            const passwordSalt = crypto.randomBytes(16).toString('hex');
            const passwordHash = this._hashPassword(password, passwordSalt);
            await this._dynamodbService.createUserInfo(userID, email, passwordSalt, passwordHash, userName);

            create = true;
            userInfo = await this._dynamodbService.getUserInfoFromEmail(email);

            console.log(`[AuthService] ${email} successfully registered`);
        }
        return {
            create,
            data: this._hidePasswordInfo(userInfo),
        };
    };

    login = async (email, password) => {
        // login
        console.log(`[AuthService] ${email} try to login`);

        // 1. get related user info
        let userInfo = await this._dynamodbService.getUserInfoFromEmail(email);
        if (userInfo === null) {
            // not yet registered
            console.log(`[AuthService] ${email} not yet registered`);
            return { success: false, error: 'Not yet registered' };
        }
        // 2. check password
        const passwordSalt = userInfo.passwordSalt;
        if (this._hashPassword(password, passwordSalt) !== userInfo.passwordHash) {
            console.log(`[AuthService] ${email} login with invalid password`);
            return { success: false, error: 'Invalid password' };
        }

        // 3. login successfully
        return { success: true, data: this._hidePasswordInfo(userInfo) };
    };
}

export default AuthService;
