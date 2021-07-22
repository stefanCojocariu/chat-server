import { AnyNaptrRecord } from "dns";
import MongoDB from "../configs/mongo-db";
import User, { IUser } from "../models/user";
import bcrypt from 'bcrypt';
import Validators from '../utils/validators';
import JWTHelper, { Tokens } from '../utils/jwt-helper'
import Session, { ISession } from '../models/session'

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
    private getRefreshTokenByUserId(userObj:IUser) : Promise<string> {
        let func = async (resolve:any, reject:any) => {
            try{
                const session:ISession[] = await Session.find({user: userObj._id})
                if(!session){
                    reject ('No session found');
                    return;
                }

                resolve(session[0].refreshToken)
            }catch(error){
                reject(error)
            }
        }

        return new Promise<string>(func);
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