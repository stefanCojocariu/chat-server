import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/user';
import AuthRepository from '../repositories/auth-repository';
import ApiResponse from '../utils/api-response';
import cookieOptions from '../utils/cookie.constants';

class AuthHandler {
    private authRepository: AuthRepository;
    private apiResponse: ApiResponse;
    private readonly cookieOptions = cookieOptions;

    constructor() {
        this.authRepository = new AuthRepository();
        this.apiResponse = new ApiResponse();
    }

    async register(req: Request, res: Response) {
        const userObj: IUser = req.body;
        try {
            const user = await this.authRepository.register(userObj);
            res.status(200).json(this.apiResponse.format(user));
        } catch (error) {
            console.log(error);
            res.status(200).json(this.apiResponse.format(null, error));
        }
    }

    async login(req: Request, res: Response) {
        const userObj: IUser = req.body;
        try {
            const tokens = await this.authRepository.login(userObj);
            res.cookie("access_token", tokens.accessToken, this.cookieOptions.accessToken);
            res.cookie("refresh_token", tokens.refreshToken, this.cookieOptions.refreshToken);
            res.status(200).json(this.apiResponse.format(null));
        } catch (error) {
            res.status(200).json(this.apiResponse.format(null, error));
        }
    }

    async logout(req: Request, res: Response) {
        console.log('COOKIES',req.cookies);
        let refreshToken = req.cookies.refresh_token

        try{
            await this.authRepository.logout(refreshToken);
            console.log('clearing cookies')
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');
            res.status(200).json(this.apiResponse.format(null));
        }catch (error){
            res.status(200).json(this.apiResponse.format(null, error));
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const users = await this.authRepository.getUsers();
            res.status(200).json(this.apiResponse.format(users));
        } catch (error) {
            console.log(error);
            res.status(200).json(this.apiResponse.format(null, error));
        }
    }
}

export default AuthHandler;