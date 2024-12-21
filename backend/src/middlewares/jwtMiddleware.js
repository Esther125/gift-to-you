import jwt from 'jsonwebtoken';
import AuthService from '../services/authService.js';
import { logWithFileInfo } from '../../logger.js';

const authService = new AuthService();

const jwtMiddleware = async (req, res, next) => {
    logWithFileInfo('info', '----- JWT -----');

    const { routerQuery } = req.query;
    const toPath = req.query.toPath;

    const { accessToken, refreshToken } = req.cookies;
    if (!accessToken || !refreshToken) {
        logWithFileInfo('info', `missing accessToken or refreshToken when go to ${toPath}`);
        return res.status(401).json({ error: 'unauthorized', toPath, routerQuery });
    }

    // check if accessToken is expired, if expired generate a new one
    let userData;
    try {
        // try accessToken first
        const userFromAccessToken = await _jwtVerify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        userData = _extractUserDataFromJwt(userFromAccessToken);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            try {
                // try refreshToken
                const userFromRefreshToken = await _jwtVerify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                userData = _extractUserDataFromJwt(userFromRefreshToken);

                // regenerate accessToken
                logWithFileInfo('info', 'accessToken expired, regenerate accessToken');
                const newAccessToken = authService.generateAccessToken(userData);
                res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: true });
            } catch (err) {
                if (err.name === 'TokenExpiredError') {
                    logWithFileInfo('info', `invalid refreshToken when go to ${toPath}`);
                    return res.status(401).json({ error: 'unauthorized', toPath, routerQuery });
                } else {
                    logWithFileInfo('error', 'Error in jwtMiddleware', err);
                    return;
                }
            }
        } else {
            logWithFileInfo('error', 'Error in jwtMiddleware', err);
            return;
        }
    }

    // add userData to req
    req.user = userData;
    logWithFileInfo('info', `user ${req.user.userID} pass jwtMiddleware when go to ${toPath}`);
    next();
};

const _jwtVerify = async (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
};

const _extractUserDataFromJwt = (userFromJwt) => {
    return {
        userID: userFromJwt.userID,
        email: userFromJwt.email,
        userName: userFromJwt.userName,
    };
};

export default jwtMiddleware;
