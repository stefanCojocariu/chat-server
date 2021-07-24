import * as socketio from 'socket.io';
import cookie from 'cookie';
import { IMessage } from '../models/message';
import ChatRepository from '../repositories/chat-repository';
import ApiResponse from '../utils/api-response';
import * as http from 'http';
import errorConstants from '../configs/error.constants';
import AuthRepository from '../repositories/auth-repository';

class Socket {
    private io: socketio.Server;
    private authRepository: AuthRepository;
    private chatRepository: ChatRepository;
    private apiResponse: ApiResponse;

    constructor(httpServer: http.Server) {
        this.io = new socketio.Server(httpServer, { cors: { origin: 'http://localhost:3000', credentials: true } });
        this.authRepository = new AuthRepository();
        this.chatRepository = new ChatRepository();
        this.apiResponse = new ApiResponse();
    }

    include() {
        this.io.use(async (socket, next) => {
            try {
                const cookies = socket.request.headers.cookie;
                if (cookies) {
                    const parsedCookies = cookie.parse(cookies);
                    console.log('access_token');
                    console.log(parsedCookies.access_token);
                    console.log('refresh_token');
                    console.log(parsedCookies.refresh_token);
                    if (socket.handshake.query['userId']?.length) {
                        await this.chatRepository.addSocket(
                            socket.handshake.query['userId'],
                            socket.id
                        );
                    }
                    next();
                }
                else {
                    next(new Error(errorConstants.AUTHORIZATION_ERROR));
                }
            } catch (error) {
                console.error(error);
            }
        });

        this.io.on('connection', (socket) => {
            socket.on('add-message', (data) => this.addMessage(data, socket.id));
        });
    }

    private async addMessage(data: IMessage, socketId: string) {
        console.log(data);
        if (data.body === '') {
            this.io.to(socketId).emit('add-message-response', {
                isSuccess: true,
                message: errorConstants.MESSAGE_NOT_FOUND
            });
            return;
        }
        if (data.from.toString() === '') {
            this.io.to(socketId).emit('add-message-response', {
                isSuccess: true,
                message: errorConstants.FROMID_NOT_FOUND
            });
            return;
        }
        if (data.to.toString() === '') {
            this.io.to(socketId).emit('add-message-response', {
                isSuccess: true,
                message: errorConstants.TOID_NOT_FOUND
            });
            return;
        }

        try {
            const [userInfo, _] = await Promise.all([
                this.authRepository.getUserInfo(data.to.toString(), { socketId: 1 }),
                this.chatRepository.insertMessage(data)
            ]);
            if (userInfo && userInfo.socketId) {
                console.log(userInfo.socketId);
                this.io.to(userInfo.socketId).emit('add-message-response', data);
            }
            else {
                this.io.to(socketId).emit('add-message-response', {
                    isSuccess: false,
                    message: errorConstants.SERVER_ERROR
                });
            }
        } catch (error) {
            this.io.to(socketId).emit('add-message-response', {
                isSuccess: false,
                message: errorConstants.SERVER_ERROR
            });
        }
    }
}

export default Socket;