import { Request, Response } from 'express';
import { isBuffer } from 'util';
import User, { IUser } from '../models/user';
import AuthRepository from '../repositories/auth-repository';
import ApiResponse from '../utils/api-response';

class AuthHandler {
    private authRepository: AuthRepository;
    private apiResponse: ApiResponse;

    constructor() {
        this.authRepository = new AuthRepository();
        this.apiResponse = new ApiResponse();
    }

    async register(req: Request, res: Response) {
        const userObj:IUser = req.body
        try {
            const user = await this.authRepository.register(userObj);
            // res.status(200).json({ data: user });
            res.status(200).json(this.apiResponse.format(user));
        } catch (error) {
            console.log(error);
            // res.status(500).json({ error });
            res.status(500).json(this.apiResponse.format(null, error));
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const users = await this.authRepository.getUsers();
            res.status(200).json(this.apiResponse.format(users));
        } catch (error) {
            console.log(error);
            res.status(500).json(this.apiResponse.format(null, error));
        }
    }
}

export default AuthHandler;