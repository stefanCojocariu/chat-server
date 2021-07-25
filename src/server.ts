import express from 'express';
import MongoDB from './configs/mongo-db';
import ServerConfig from './configs/server-config';
import Routes from './routes/routes';
import Socket from './configs/socket';

class Server {
    private app: express.Application;
    private router: express.Router;
    private routes: Routes;
    private mongoDb: MongoDB;
    private serverConfig: ServerConfig;

    constructor() {
        this.app = express();
        this.router = express.Router();
        this.mongoDb = new MongoDB();
        this.routes = new Routes(this.app, this.router);
        this.serverConfig = new ServerConfig(this.app);
    }

    start(): void {
        const port = process.env.PORT || 8080;

        // Adding server configs
        this.serverConfig.include();

        // Connecting to Mongo database
        this.mongoDb.connect();

        // Adding routes
        this.routes.include();

        // Starting server
        const httpServer = this.app.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });

        // Starting socket server and adding socket events
        const socket = new Socket(httpServer);
        socket.include();
    }
}

const server = new Server();
server.start();