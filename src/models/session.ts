import moongose, { ObjectId } from 'mongoose';
const Schema = moongose.Schema;

export interface ISession extends moongose.Document {
    user: string | ObjectId,
    refreshToken: string,
    date: string
};

const SessionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    refreshToken: {
        type: String,
    },
    date: {
        type: String,
        default: Date.now,
    }
}, { collection: 'Session' });

const Session = moongose.model<ISession>('Session', SessionSchema);

export default Session;