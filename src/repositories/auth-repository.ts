import MongoDB from "../configs/mongo-db";
import User, { IUser } from "../models/user";

class AuthRepository {
    register(): Promise<IUser> {
        return new Promise(
            async (resolve, reject) => {
                try {
                    const newUser = await User.create({ name: 'Stefan Cojocariu', username: 'stefan.cojocariu'});
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