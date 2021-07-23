import { Server } from 'socket.io';
import { IMessage } from '../models/message';
import ChatRepository from '../repositories/chat-repository';
import ApiResponse from '../utils/api-response';

interface ISocket extends Socket {
}

class Socket {
    private readonly USER_NOT_FOUND = 'User id is missing.';
    private readonly MESSAGE_NOT_FOUND = 'Message can not be empty.';
    private readonly FROMID_NOT_FOUND = 'From id can not be empty.';
    private readonly TOID_NOT_FOUND = 'To id can not be empty.';
    private readonly SERVER_ERROR = 'Error occurred on the server.';

    private io: Server;
    private chatRepository: ChatRepository;
    private apiResponse: ApiResponse;

    constructor(socket: Server) {
        this.io = socket;
        this.chatRepository = new ChatRepository();
        this.apiResponse = new ApiResponse();
    }

    include() {
        this.io.use(async (socket, next) => {
            try {
                if (socket.handshake.query['userId']?.length) {
                    await this.chatRepository.addSocket(
                        socket.handshake.query['userId'],
                        socket.id
                    );
                }

                next();
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
                message: this.MESSAGE_NOT_FOUND
            });
            return;
        }
        if (data.from.toString() === '') {
            this.io.to(socketId).emit('add-message-response', {
                isSuccess: true,
                message: this.FROMID_NOT_FOUND
            });
            return;
        }
        if (data.to.toString() === '') {
            this.io.to(socketId).emit('add-message-response', {
                isSuccess: true,
                message: this.TOID_NOT_FOUND
            });
            return;
        }

        try {
            const [userInfo, _] = await Promise.all([
                this.chatRepository.getUserInfo(data.to.toString(), { socketId: 1 }),
                this.chatRepository.insertMessage(data)
            ]);
            if (userInfo && userInfo.socketId) {
                console.log(userInfo.socketId);
                this.io.to(userInfo.socketId).emit('add-message-response', data);
            }
            else {
                this.io.to(socketId).emit('add-message-response', {
                    isSuccess: false,
                    message: this.SERVER_ERROR
                });
            }
        } catch (error) {
            this.io.to(socketId).emit('add-message-response', {
                isSuccess: false,
                message: this.SERVER_ERROR
            });
        }
    }
}

export default Socket;