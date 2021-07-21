import { ObjectId } from "mongoose";
import Conversation, { IConversation } from "../models/conversation";
import Message, { IMessage } from "../models/message";
import User, { IUser } from "../models/user";

class ChatRepository {
    insertConversation(members: ObjectId[]): Promise<IConversation> {
        return new Promise(
            async (resolve, reject) => {
                try {
                    const conversation = await Conversation.create({members, lastMessage: ''});
                    resolve(conversation);
                }
                catch (error) {
                    reject(error);
                }
            }
        );
    }

    insertMessage(message: IMessage): Promise<IMessage> {
        return new Promise(
            async (resolve, reject) => {
                try {
                    const insertedMessage = await Message.create(message);
                    resolve(insertedMessage);
                }
                catch (error) {
                    reject(error);
                }
            }
        );
    }

    getOnlineUsers(): Promise<IUser[]> {
        return new Promise(
            async (resolve, reject) => {
                try {
                    const onlineUsers = await User.find({ isOnline: true });
                    resolve(onlineUsers);
                } catch (error) {
                    reject(error);
                }
            }
        );
    }

    getConversationMessages(conversationId: ObjectId): Promise<IMessage[]> {
        return new Promise(
            async (resolve, reject) => {
                try {
                    const messages = await Message.find({ conversationId });
                    resolve(messages);
                } catch (error) {
                    reject(error);
                }
            }
        );
    }
}

export default ChatRepository;