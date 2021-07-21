import { Request, Response } from 'express';
import AuthRepository from '../repositories/auth-repository';

class AuthHandler {
    private authRepository: AuthRepository;

    constructor() {
        this.authRepository = new AuthRepository();
    }

    async register(req: Request, res: Response) {
        try {
            const user = await this.authRepository.register();
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