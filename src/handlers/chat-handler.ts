import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';
import { IMessage } from '../models/message';
import ChatRepository from "../repositories/chat-repository";
import ApiResponse from '../utils/api-response';

class ChatHandler {
    private chatRepository: ChatRepository;
    private apiResponse: ApiResponse;

    constructor() {
        this.chatRepository = new ChatRepository();
        this.apiResponse = new ApiResponse();
    }

    async checkSession(req: Request, res: Response) {
        res.status(200).json(this.apiResponse.format(1));
    }

    async insertConversation(req: Request, res: Response) {
        const members = req.body.members;
        if (members) {
            try {
                const conversation = await this.chatRepository.insertConversation(members);
                res.status(200).json(this.apiResponse.format(conversation));
            } catch (error) {
                res.status(200).json(this.apiResponse.format(null, error));
            }
        }
        else {
            res.status(200).json(this.apiResponse.format(null, 'Missing members of conversation in body.'));
        }
    }

    async insertMessage(req: Request, res: Response) {
        const message: IMessage = req.body.message;
        if (message) {
            try {
                const insertMessage = await this.chatRepository.insertMessage(message);
                res.status(200).json(this.apiResponse.format(insertMessage));
            } catch (error) {
                res.status(200).json(this.apiResponse.format(null, error));
            }
        }
        else {
            res.status(200).json(this.apiResponse.format(null, 'Missing message in body.'));
        }
    }

    async getOnlineUsers(req: Request, res: Response) {
        try {
            const onlineUsers = await this.chatRepository.getOnlineUsers();
            res.status(200).json(this.apiResponse.format(onlineUsers));
        } catch (error) {
            res.status(200).json(this.apiResponse.format(null, error));
        }
    }

    async getConversationMessages(req: Request, res: Response) {
        const conversationId = req.body.conversationId;
        if (conversationId) {
            try {
                const conversationMessages = await this.chatRepository.getConversationMessages(conversationId);
                res.status(200).json(this.apiResponse.format(conversationMessages));
            } catch (error) {
                res.status(200).json(this.apiResponse.format(null, error));
            }
        }
        else {
            res.status(200).json(this.apiResponse.format(null, 'Missing conversationId in body.'));
        }
    }
}

export default ChatHandler;