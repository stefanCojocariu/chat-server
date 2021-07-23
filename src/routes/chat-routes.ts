import { Router, Request, Response } from 'express';
import ChatHandler from '../handlers/chat-handler';

export default class ChatRoutes {
    router: Router;
    chatHandler: ChatHandler;

    constructor(router: Router) {
        this.router = router;
        this.chatHandler = new ChatHandler();
    }

    include(): void {
        this.router.post('/insertConversation', (req: Request, res: Response) => { 
            this.chatHandler.insertConversation(req, res);
        });

        this.router.post('/insertMessage', (req: Request, res: Response) => { 
            this.chatHandler.insertMessage(req, res);
        });

        this.router.get('/onlineUsers', (req: Request, res: Response) => { 
            this.chatHandler.getOnlineUsers(req, res);
        });
        
        this.router.post('/getConversationMessages', (req: Request, res: Response) => { 
            this.chatHandler.getConversationMessages(req, res);
        });
    }
}