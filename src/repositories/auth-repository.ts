import User, { IUser } from "../models/user";
import bcrypt from 'bcrypt';
import Validators from '../utils/validators';
import JWTHelper, { Tokens } from '../utils/jwt-helper'
import Session, { ISession } from '../models/session'
import { JwtPayload } from "jsonwebtoken";
import errorConstants from "../utils/error.constants";
import mongoose from "mongoose";

class AuthRepository {
    private validators: Validators;
    private jwtHelper: JWTHelper;
    constructor() {
        this.validators = new Validators();
        this.jwtHelper = new JWTHelper();
    }

    async authorization(accessToken: string, refreshToken: string): Promise<[Tokens, string]> {
        // trycatch to verify if access token expired
        try {
            const payload = await this.jwtHelper.verifyAccessToken(accessToken) as JwtPayload;

            return [{ accessToken, refreshToken }, payload.aud as string];
        } catch (error) {
            if (error.name == errorConstants.server.JWT_TOKENEXPIREDERROR) {
                console.log("Access token expired");
                // if error is thrown here, the refresh token expired, 
                // or the refresh token cookie does not match the one in session document
                // or something bad happened, in any case the user needs to sign in again
                const payload = await this.jwtHelper.verifyRefreshToken(refreshToken) as JwtPayload;
                if (payload.aud) {
                    const userId = payload.aud as string;
                    const userObj = await this.getUserInfo(userId);
                    if (userObj) {
                        const sessions = await this.getSessionsByUserId(userId);
                        if (sessions.length) {
                            if (sessions[0].refreshToken == refreshToken) {
                                const newAccessToken = await this.jwtHelper.signAccessToken(userObj);

                                return [{ accessToken: newAccessToken, refreshToken }, userId];
                            }
                            else {
                                console.log(3);
                                throw errorConstants.server.ERROR_NEEDS_SIGNIN;
                            }
                        }
                        else {
                            console.log(4);
                            throw errorConstants.server.ERROR_NEEDS_SIGNIN;
                        }
                    }
                    else {
                        console.log(5);
                        throw errorConstants.server.ERROR_NEEDS_SIGNIN;
                    }
                }
                else {
                    console.log(6);
                    throw errorConstants.server.ERROR_NEEDS_SIGNIN;
                }
            }
            else {
                console.log(7);
                throw errorConstants.server.ERROR_NEEDS_SIGNIN;
            }
        }
    }

    async getUserInfo(userId: string, projection?: any): Promise<IUser | null> {
        return await User.findById(userId, projection);
    }

    private async getSessionsByUserId(userId: string): Promise<ISession[]> {
        const sessions = await Session.find({ user: userId }, { _id: 1, refreshToken: 1 });
        // only one session
        if (sessions.length > 1) {
            await this.deleteSessionsByUserId(userId);
            return [];
        }

        return sessions;
    }

    private async deleteSessionsByUserId(userId: string): Promise<number | undefined> {
        const session = await Session.remove({ user: userId });

        return session.ok;
    }

    private async generateNewTokens(userObj: IUser): Promise<Tokens> {
        const accessToken = await this.jwtHelper.signAccessToken(userObj);
        const refreshToken = await this.jwtHelper.signRefreshToken(userObj);

        return { accessToken: accessToken, refreshToken: refreshToken };
    }

    async register(userObj: IUser): Promise<IUser> {

        //encrypt password
        const saltRounds = 3;
        const passHash = await bcrypt.hash(userObj.password, saltRounds);
        userObj.password = passHash;
        const newUser = await User.create(userObj);

        const user = await newUser.save();

        return user;

    }

    async login(userObj: IUser): Promise<Tokens> {
        //check user/pass combination
        const users = await User.find({ username: userObj.username });
        if (!users) {
            throw errorConstants.client.INCORRECT_CREDENTIALS;
        }

        if (users.length != 1) {
            throw errorConstants.client.SERVER_ERROR;
        }

        const hashPass = users[0].password;
        var compare = await bcrypt.compare(userObj.password, hashPass);
        if (!compare) {
            throw errorConstants.client.INCORRECT_CREDENTIALS;
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
        return tokens;
    }

    async logout(refreshToken: string) {
        const decoded = await this.jwtHelper.verifyRefreshToken(refreshToken) as JwtPayload;
        console.log('decoded', decoded)
        const userId = decoded.aud as string;
        const sessionDetails = await this.getSessionsByUserId(userId);
        console.log('sessionDetails', sessionDetails);

        await Session.deleteOne({ _id: sessionDetails[0]._id });
    }

    async getUsers(): Promise<IUser[]> {
        return await User.find();
    }
}

export default AuthRepository;