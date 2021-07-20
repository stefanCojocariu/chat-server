import { Application, Router, Request, Response } from 'express';
import AuthRoutes from './auth-routes';
import ChatRoutes from './chat-routes';

export default class Routes {
    private app: Application;
    private router: Router;
    private auth: AuthRoutes;
    private chat: ChatRoutes;
    private apiUrl: string;

    constructor(app: Application, router: Router) {
        this.app = app;
        this.router = router;
        this.auth = new AuthRoutes(this.router);
        this.chat = new ChatRoutes(this.router);
        this.apiUrl = '/api';
    }

    include(): void {
        this.auth.include();
        this.chat.include();

        this.app.get(`${this.apiUrl}/healthcheck`, (req: Request, res: Response) => {
            res.send(200);
        });

        this.app.use(`${this.apiUrl}/auth`, this.auth.router);
        this.app.use(`${this.apiUrl}/chat`, this.chat.router);
    }
}