import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/user';
import AuthRepository from '../repositories/auth-repository';
import ApiResponse from '../utils/api-response';

class AuthHandler {
    private authRepository: AuthRepository;
    private apiResponse: ApiResponse;
    private readonly accessToken_cookieOptions: Object = {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRESIN,
        httpOnly: true,
        secure: true
    };
    private readonly refreshToken_cookieOptions: Object = {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRESIN,
        httpOnly: true,
        secure: true
    };

    constructor() {
        this.authRepository = new AuthRepository();
        this.apiResponse = new ApiResponse();
    }
    
    async authorization(req: Request, res: Response, next: NextFunction) {
        const accessToken = req.cookies.access_token;
        const refreshToken = req.cookies.refresh_token;
        try {
            const [tokens, _] = await this.authRepository.authorization(accessToken, refreshToken);

            res.cookie("access_token", tokens.accessToken, this.accessToken_cookieOptions);
            res.cookie("refresh_token", tokens.refreshToken, this.refreshToken_cookieOptions);
            next();
        } catch (error) {
            res.clearCookie("access_token");
            res.clearCookie("refresh_token");
            console.log(error);
            res.status(200).json(this.apiResponse.format(null, error));
        }
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
            res.cookie("access_token", tokens.accessToken, this.accessToken_cookieOptions);
            res.cookie("refresh_token", tokens.refreshToken, this.refreshToken_cookieOptions);
            res.status(200).json(this.apiResponse.format('OK'));
        } catch (error) {
            res.status(200).json(this.apiResponse.format(null, error));
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
            res.status(200).json(this.apiResponse.format(null, error));
        }
    }
}

export default AuthHandler;