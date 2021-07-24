import User, { IUser } from "../models/user";
import bcrypt from 'bcrypt';
import Validators from '../utils/validators';
import JWTHelper, { Tokens } from '../utils/jwt-helper'
import Session, { ISession } from '../models/session'
import { JwtPayload } from "jsonwebtoken";
import errorConstants from "../configs/error.constants";
import mongoose from "mongoose";

class AuthRepository {
    private validators: Validators;
    private jwtHelper: JWTHelper;
    constructor() {
        this.validators = new Validators();
        this.jwtHelper = new JWTHelper();
    }

    async authorization(accessToken: string, refreshToken: string): Promise<Tokens> {
        console.log(accessToken, refreshToken);
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
                console.log(payload);
                if (payload.aud) {
                    const userId = payload.aud as string;
                    const userObj = await this.getUserInfo(userId);
                    if (userObj) {
                        const sessions = await this.getSessionsByUserId(userId);
                        if (sessions.length) {
                            if (sessions[0].refreshToken == refreshToken) {
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

    private async getSessionsByUserId(userId: string): Promise<ISession[]> {
        const sessions = await Session.find({ user: userId}, { _id: 1, refreshToken: 1 });
        // only one session
        if(sessions.length > 1) {
            await this.deleteSessionsByUserId(userId);
            return [];   
        }
        
        return sessions;
    }

    private async deleteSessionsByUserId(userId: string): Promise<number | undefined> {
        const session = await Session.remove({ user: userId});

        return session.ok;
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

                    userObj._id = users[0]._id;
                    //generate AccessToken / RefreshToken
                    const tokens = await this.generateNewTokens(userObj);

                    // check to see if the user has already a session
                    const session = await this.getSessionsByUserId(users[0]._id.toString());
                    if (session.length) {
                        // if session exists then update refresh token
                        await Session.updateOne({ _id: session[0]._id }, { refreshToken: tokens.refreshToken });
                    }
                    else {
                        // if session does not exist create one
                        const newSession = await Session.create(
                            {
                                user: users[0]._id.toString(),
                                refreshToken: tokens.refreshToken,
                            }
                        );
                        await newSession.save();
                    }
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