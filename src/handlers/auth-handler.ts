import { Request, Response } from 'express';
import { isBuffer } from 'util';
import User, { IUser } from '../models/user';
import AuthRepository from '../repositories/auth-repository';
import ApiResponse from '../utils/api-response';

class AuthHandler {
    private authRepository: AuthRepository;
    private apiResponse: ApiResponse;
    private accessToken_cookieOptions: Object;
    private refreshToken_cookieOptions: Object;

    constructor() {
        this.authRepository = new AuthRepository();
        this.apiResponse = new ApiResponse();
        this.accessToken_cookieOptions = {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRESIN,
            httpOnly: true,
            secure: true
        };
        this.refreshToken_cookieOptions = {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRESIN,
            httpOnly: true,
            secure: true
        }
    }

    async register(req: Request, res: Response) {
        const userObj: IUser = req.body;
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

    async login(req: Request, res: Response) {
        const userObj: IUser = req.body;
        try {
            const tokens = await this.authRepository.login(userObj);
            res.cookie("access_token", tokens.accessToken, this.accessToken_cookieOptions);
            res.cookie("refresh_token", tokens.refreshToken, this.refreshToken_cookieOptions);
            res.status(200).json(this.apiResponse.format('OK'));
        } catch (error) {
            res.status(500).json(this.apiResponse.format(null, error));
        }
    }

    async logout(req: Request, res: Response) {
        //check refreshToken
        //delete session
        //clear cookies
    }

    async refreshAccessToken(req: Request, res: Response) {

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