import { AnyNaptrRecord } from "dns";
import MongoDB from "../configs/mongo-db";
import User, { IUser } from "../models/user";
import bcrypt from 'bcrypt';
import Validators from '../utils/validators';
import JWTHelper, { Tokens } from '../utils/jwt-helper'
import Session, { ISession } from '../models/session'
import { throws } from "assert";

class AuthRepository {
    private validators: Validators;
    private jwtHelper: JWTHelper;
    constructor() {
        this.validators = new Validators();
        this.jwtHelper = new JWTHelper();
    }
    authorization() { }
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
    private getRefreshTokenByUserId(userObj:IUser) : Promise<ISession> {
        let func = async (resolve:any, reject:any) => {
            try{
                const session:ISession[] = await Session.find({user: userObj._id})
                if(!session){
                    reject ('No session found');
                    return;
                }

                resolve({_id: session[0]._id, refreshToken: session[0].refreshToken})
            }catch(error){
                reject(error)
            }
        }

        return new Promise<ISession>(func);
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

                    userObj.id = users[0]._id;

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

    async logout(refreshTokenCookie: string){
        try{
            const decoded = await this.jwtHelper.verifyRefreshToken(refreshTokenCookie);
            console.log('decoded', decoded)
            const userId = decoded.id;
            const sessionDetails = await this.getRefreshTokenByUserId(userId);
            console.log('sessionDetails', sessionDetails)

            if(refreshTokenCookie == sessionDetails._id){
                await Session.deleteOne({_id: sessionDetails._id});
            }else{
                throw 'already logged out'
            }

        }catch(error){
            throw error;
        }
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