import { userInfo } from 'os';
import DynamodbService from './dynamodbService.js';
import crypto from 'crypto';

class AuthService {
    constructor() {
        this._dynamodbService = new DynamodbService();
        this._USERID_LENGTH = 8;
    }

    _genNewUserID = async () => {
        let userID;
        let userName;
        do {
            userID = crypto.randomBytes(this._USERID_LENGTH / 2).toString('hex');
            userName = await this._dynamodbService.getUserNameFromID(userID);
        } while (userName);
        return userID;
    };

    _hashPassword = (password, passwordSalt) => {
        // hash password
        return crypto.pbkdf2Sync(password, passwordSalt, 1000, 64, 'sha512').toString('hex');
    };

    _getUserIDFromLabel = (label) => {
        const pos = label.indexOf('#');
        return label.slice(pos + 1, pos + 1 + this._USERID_LENGTH);
    };

    _hidePasswordInfo = (userInfo) => {
        return {
            userID: this._getUserIDFromLabel(userInfo.pk),
            email: userInfo.email,
            userName: userInfo.userName,
        };
    };

    register = async (email, password, userName) => {
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
            const userID = await this._genNewUserID();
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
