import User, { IUser } from "../models/user";
import bcrypt from 'bcrypt';
import Validators from '../utils/validators';
import JWTHelper, { Tokens } from '../utils/jwt-helper'
import Session, { ISession } from '../models/session'
import { JwtPayload } from "jsonwebtoken";
import errorConstants from "../configs/error.constants";

class AuthRepository {
    private validators: Validators;
    private jwtHelper: JWTHelper;
    constructor() {
        this.validators = new Validators();
        this.jwtHelper = new JWTHelper();
    }

    async authorization(accessToken: string, refreshToken: string): Promise<Tokens> {
        // trycatch to verify if access token expired
        try {
            await this.jwtHelper.verifyAccessToken(accessToken) as JwtPayload;
        } catch (error) {
            console.log('repo');
            if (error.name == errorConstants.JWT_TOKENEXPIREDERROR) {
                console.log('access token expired');
                // if error is thrown here, the refresh token expired, 
                // or the refresh token cookie does not match the one in session document
                // or something bad happened, in any case the user needs to sign in again
                const payload = await this.jwtHelper.verifyRefreshToken(refreshToken) as JwtPayload;
                if (payload.aud) {
                    const userObj = await this.getUserInfo(payload.aud as string);
                    if (userObj) {
                        await this.getRefreshTokenByUserId(userObj);
                        const newAccessToken = await this.jwtHelper.signAccessToken(userObj);
                
                        return { accessToken: newAccessToken, refreshToken };
                    }
                    else {
                        throw errorConstants.ERROR_NEEDS_SIGNIN;
                    }
                }
                else {
                    throw errorConstants.ERROR_NEEDS_SIGNIN;
                }
            }
            else {
                throw errorConstants.ERROR_NEEDS_SIGNIN;
            }
        }

        return { accessToken, refreshToken };
    }

    async getUserInfo(userId: string, projection?: any): Promise<IUser | null> {
        return await User.findById(userId, projection);
    }

    private async getRefreshTokenByUserId(userObj: IUser): Promise<string> {
        const session: ISession[] = await Session.find({ _id: userObj._id }, { refreshToken: 1 })
        if (!session.length) {
            throw errorConstants.SESSION_NOT_FOUND
        }

        return session[0].refreshToken;
    }

    private generateNewTokens(userObj: IUser): Promise<Tokens> {
        return new Promise(
            async (resolve, reject) => {
                try {
                    const accessToken = await this.jwtHelper.signAccessToken(userObj);
                    const refreshToken = await this.jwtHelper.signRefreshToken(userObj);

                    resolve({ accessToken: accessToken, refreshToken: refreshToken });
                }
                catch (err) {
                    reject(err);
                }
            }
        )
    }

    register(userObj: IUser): Promise<IUser> {
        return new Promise(
            async (resolve, reject) => {
                try {
                    //encrypt password
                    const saltRounds = 3;
                    const passHash = await bcrypt.hash(userObj.password, saltRounds);
                    userObj.password = passHash;
                    const newUser = await User.create(userObj);

                    const user = await newUser.save();

                    resolve(user);
                } catch (error) {
                    reject(error);
                }
            }
        );
    }

    login(userObj: IUser): Promise<Tokens> {
        return new Promise(
            async (resolve, reject) => {
                try {
                    //check user/pass combination
                    const users = await User.find({ username: userObj.username });
                    if (!users) {
                        reject('Username / Email or Password is invalid');
                        return;
                    }

                    if (users.length != 1) {
                        reject('Bad boo boo');
                        return;
                    }

                    const hashPass = users[0].password;
                    var compare = await bcrypt.compare(userObj.password, hashPass);
                    if (!compare) {
                        reject('Username / Email or Password is invalid');
                        return;
                    }

                    //generate AccessToken / RefreshToken
                    const tokens = await this.generateNewTokens(userObj);
                    //insert new session for user
                    const newSession = await Session.create(
                        {
                            user: users[0]._id,
                            refreshToken: tokens.refreshToken,
                        }
                    );
                    const session = await newSession.save();
                    console.log(session);
                    resolve(tokens);

                } catch (error) {
                    console.log(error);
                    reject(error);
                }
            }
        )
    }

    getUsers(): Promise<IUser[]> {
        return new Promise(
            async (resolve, reject) => {
                try {
                    const users = await User.find();

                    resolve(users);
                } catch (error) {
                    reject(error);
                }
            }
        );
    }
}

export default AuthRepository;