import { IUser } from "../models/user";
import JWT from 'jsonwebtoken'

export interface Tokens {
    accessToken:string,
    refreshToken:string
}

class JWTHelper {
    constructor() { }
    signAccessToken(userObj: IUser): Promise<string> {
        return new Promise(
            async (resolve, reject) => {
                try{
                    const payload = userObj;
                    const secret = process.env.ACCESS_TOKEN_SECRET;
                    if (!secret) {
                        reject('no jwt secret');
                        return;
                    }
                    console.log(process.env.ACCESS_TOKEN_EXPIRESIN);
                    const signOptions = {
                        expiresIn: process.env.ACCESS_TOKEN_EXPIRESIN,
                        audience: userObj.username
                    };
    
                    var accessToken = await JWT.sign(payload, secret, signOptions);
                    resolve(accessToken);
                } catch (error) {
                    reject(error);
                }
            }
        )
    }

    signRefreshToken(userObj: IUser): Promise<string> {
        return new Promise(
            async (resolve, reject) => {
                try{
                    const payload = userObj;
                    const secret = process.env.ACCESS_TOKEN_SECRET;
                    if (!secret) {
                        reject('no jwt secret');
                        return;
                    }
                    console.log(process.env.ACCESS_TOKEN_EXPIRESIN);
                    const signOptions = {
                        expiresIn: process.env.ACCESS_TOKEN_EXPIRESIN,
                        audience: userObj.username
                    };
    
                    var accessToken = await JWT.sign(payload, secret, signOptions);
                    resolve(accessToken);
                } catch (error) {
                    reject(error);
                }
            }
        )
    }
}

export default JWTHelper;