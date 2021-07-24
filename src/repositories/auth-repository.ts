import User, { IUser } from "../models/user";
import bcrypt from 'bcrypt';
import Validators from '../utils/validators';
import JWTHelper, { Tokens } from '../utils/jwt-helper'
import Session, { ISession } from '../models/session'
import { JwtPayload } from "jsonwebtoken";
import error from "../configs/error.constants";

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
            if (error.name == error.JWT_TOKENEXPIREDERROR) {
                // if error is thrown here, the refresh token expired, 
                // or the refresh token cookie does not match the one in session document
                // or something bad happened, in any case the user needs to sign in again
                const payload = await this.jwtHelper.verifyRefreshToken(refreshToken) as JwtPayload;
                const userObj = new User({ _id: payload.aud });
                await this.getRefreshTokenByUserId(userObj);
                const newAccessToken = await this.jwtHelper.signAccessToken(userObj);

                return { accessToken: newAccessToken, refreshToken };
            }
        }

        return { accessToken, refreshToken };
    }

    private async getRefreshTokenByUserId(userObj: IUser): Promise<string> {
        const session: ISession[] = await Session.find({ _id: userObj._id }, { refreshToken: 1 })
        if (!session.length) {
            throw error.SESSION_NOT_FOUND
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