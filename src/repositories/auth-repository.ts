import { AnyNaptrRecord } from "dns";
import MongoDB from "../configs/mongo-db";
import User, { IUser } from "../models/user";

class AuthRepository {
    register(userObj:IUser): Promise<IUser> {
        return new Promise(
            async (resolve, reject) => {
                try {
                    const findOneByEmail = await User.findOne({email: userObj.email});
                    if(findOneByEmail){
                        reject('email already used');
                        return;
                    }
                    const findOneByName = await User.findOne({username: userObj.username});
                    if(findOneByName){
                        reject('username unavailable');
                        return;
                    }
                    const newUser = await User.create(userObj);

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