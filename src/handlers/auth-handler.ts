import { Request, Response } from 'express';
import { isBuffer } from 'util';
import User, { IUser } from '../models/user';
import AuthRepository from '../repositories/auth-repository';

class AuthHandler {
    private authRepository: AuthRepository;

    constructor() {
        this.authRepository = new AuthRepository();
    }

    async register(req: Request, res: Response) {
        const userObj:IUser = req.body
        try {
            const user = await this.authRepository.register(userObj);
            res.status(200).json({ data: user });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error });
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const users = await this.authRepository.getUsers();
            res.status(200).json({ data: users });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error });
        }
    }
}

export default AuthHandler;