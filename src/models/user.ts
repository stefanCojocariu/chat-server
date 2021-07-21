import moongose from 'mongoose';

const Schema = moongose.Schema;

export interface IUser extends moongose.Document {
    name: string,
    username: string,
    password:string,
    email: string,
    date: string,
    isOnline: boolean,
    socketId: string
};

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
    email: {
        type: String,
    },
    date: {
        type: String,
        default: Date.now,
    },
    isOnline: {
        type: Boolean
    }
}, { collection: 'User' });

const User = moongose.model<IUser>('User', UserSchema);

export default User;