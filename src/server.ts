import express from 'express';
import * as http from 'http';
import MongoDB from './configs/mongo-db';
import ServerConfig from './configs/server-config';
import Routes from './routes/routes';
import * as socketio from 'socket.io';
import Socket from './configs/socket';

class Server {
    private app: express.Application;
    private router: express.Router;
    private http: http.Server;
    private routes: Routes;
    private mongoDb: MongoDB;
    private serverConfig: ServerConfig;
    private io: socketio.Server;
    private socketEvents: Socket;

    constructor() {
        this.app = express();
        this.router = express.Router();
        this.http = http.createServer(this.app);
        this.mongoDb = new MongoDB();
        this.routes = new Routes(this.app, this.router);
        this.serverConfig = new ServerConfig(this.app);
        this.io = new socketio.Server(this.http, { cors: { origin: 'http://localhost:3000' } });
        this.socketEvents = new Socket(this.io);
    }

    start(): void {
        const port = process.env.PORT || 8080;

        // Adding server configs
        this.serverConfig.include();

        // Connecting to Mongo database
        this.mongoDb.connect();

        // Adding routes
        this.routes.include();

        // Adding socket events
        this.socketEvents.include();

        // Starting server
        this.http.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });
    }
}

const server = new Server();
server.start();