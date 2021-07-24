import { IUser } from "../models/user";
import JWT, { JwtPayload } from 'jsonwebtoken';
import error from '../configs/error.constants';

export interface Tokens {
    accessToken: string,
    refreshToken: string
}

class JWTHelper {
    constructor() { }

    async signAccessToken(userObj: IUser): Promise<string> {
        const payload = userObj._id;
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) {
            throw error.JWT_NOSECRET;
        }
        const signOptions = {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRESIN,
            audience: userObj.username
        };

        return JWT.sign(payload, secret, signOptions);
    }

    async signRefreshToken(userObj: IUser): Promise<string> {
        const payload = userObj;
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if (!secret) {
            throw error.JWT_NOSECRET;
        }
        //!!!!! WILL BE ALWAYS THE SAME - EPIRES IN SHOW TAKE CURRENT DATE + env variable
        const signOptions = {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRESIN,
            audience: userObj.username
        };

        return JWT.sign(payload, secret, signOptions);
    }

    async verifyAccessToken(accessToken: string): Promise<string | JwtPayload> {
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if (!secret) {
            throw error.JWT_NOSECRET;
        }
        return JWT.verify(accessToken, secret);
    }

    async verifyRefreshToken(refreshToken: string): Promise<string | JwtPayload> {
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if (!secret) {
            throw error.JWT_NOSECRET;
        }
        return JWT.verify(refreshToken, secret)
    }
}

export default JWTHelper;