import moongose from 'mongoose';
import Validators from '../utils/validators';
import uniqueValidator from 'mongoose-unique-validator';

const Schema = moongose.Schema;
const validators = new Validators();

export interface IUser extends moongose.Document {
    name: string,
    username: string,
    password: string,
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
        trim: true,
        lowercase: true,
        required: 'Username is required',
        unique: true,
        validate: [validators.validateUsername, 'Please fill a valid username (alphanumeric + "_" + ".")']
    },
    password: {
        type: String,
        required: 'Password is required',
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: 'Email address is required',
        unique: true,
        validate: [validators.validateEmail, 'Please fill a valid email address']
    },
    date: {
        type: String,
        default: Date.now,
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    socketId: {
        type: String
    }
}, { collection: 'User' });

UserSchema.plugin(uniqueValidator);
const User = moongose.model<IUser>('User', UserSchema);

export default User;