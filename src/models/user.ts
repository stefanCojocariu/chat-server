import moongose from 'mongoose';

const Schema = moongose.Schema;

export interface IUser extends moongose.Document {
    name: string,
    username: string,
    password:string,
    date: string
};

export interface UserObj {
    name: string,
    username: string,
    password:string,
    date?: string
}

const UserSchema = new Schema({
    name: {
        type: String,
    },
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    date: {
        type: String,
        default: Date.now,
    }
}, { collection: 'User' });

const User = moongose.model<IUser>('User', UserSchema);

export default User;