import { AnyNaptrRecord } from "dns";
import MongoDB from "../configs/mongo-db";
import User, { IUser, UserObj } from "../models/user";

class AuthRepository {
    private mongoDb: MongoDB;

    constructor() {
        this.mongoDb = new MongoDB();
    }

    register(userObj:UserObj): Promise<IUser> {
        return new Promise(
            async (resolve, reject) => {
                try {
                    let newUserObj;
                    if (!userObj) {
                        newUserObj = {
                            name: 'Stefan Cojocariu',
                            username: 'stefan.cojocariu',
                            password: '1234'
                        }
                    } else {
                        newUserObj = userObj
                    }

                    const findOneByEmail = await User.findOne({email: newUserObj.email});
                    if(findOneByEmail){
                        reject('email already used');
                        return;
                    }
                    const findOneByName = await User.findOne({username: newUserObj.username});
                    if(findOneByName){
                        reject('username unavailable');
                        return;
                    }
                    const newUser = await User.create(newUserObj);

                    const user = await newUser.save();

                    resolve(user);
                } catch (error) {
                    reject(error);
                }
            }
        );
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