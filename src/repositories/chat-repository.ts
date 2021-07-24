import { ObjectId, Types } from "mongoose";
import Conversation, { IConversation } from "../models/conversation";
import Message, { IMessage } from "../models/message";
import User, { IUser } from "../models/user";

class ChatRepository {
    async insertConversation(members: ObjectId[]): Promise<IConversation> {
        return await Conversation.create({ members, lastMessage: '' });
    }

    async insertMessage(message: IMessage): Promise<IMessage> {
        return await Message.create(message);
    }

    async getOnlineUsers(): Promise<IUser[]> {
        return await User.find({ isOnline: true });
    }

    async getConversationMessages(conversationId: ObjectId): Promise<IMessage | null> {
        return await Message.findById({ conversationId });
    }

    async addSocket(userId: string | string[], socketId: string): Promise<IUser | null> {
        return await User.findByIdAndUpdate(userId, { socketId });
    }
}

export default ChatRepository;