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

let validateEmail = function(email:string) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

let validateUsername = function(username:string){
    var re = /^[a-z0-9_\.]+$/;
    return re.test(username);
}

const UserSchema = new Schema({
    name: {
        type: String,
    },
    username: {
        type: String,
        trim: true,
        lowercase: true,
        required: 'Username is required',
        validate: [validateUsername, 'Please fill a valid username (alphanumeric + "_" + ".")']
    },
    password: {
        type: String,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address']
    },
    date: {
        type: String,
        default: Date.now,
    },
    isOnline: {
        type: Boolean,
        default: false
    }
}, { collection: 'User' });

const User = moongose.model<IUser>('User', UserSchema);

export default User;