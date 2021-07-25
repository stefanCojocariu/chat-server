import { NextFunction, Request, Response } from 'express';
import AuthRepository from "../repositories/auth-repository"
import ApiResponse from "../utils/api-response";
import cookieOptions from '../utils/cookie.constants';

class Middleware {
    private authRepository: AuthRepository;
    private apiResponse: ApiResponse;
    private readonly cookieOptions = cookieOptions;

    constructor(){
        this.authRepository = new AuthRepository;
        this.apiResponse = new ApiResponse();
    }

    async authorization(req: Request, res: Response, next: NextFunction) {
        const accessToken = req.cookies.access_token;
        const refreshToken = req.cookies.refresh_token;
        try {
            const [tokens, _] = await this.authRepository.authorization(accessToken, refreshToken);

            res.cookie("access_token", tokens.accessToken, this.cookieOptions.accessToken);
            res.cookie("refresh_token", tokens.refreshToken, this.cookieOptions.refreshToken);
            next();
        } catch (error) {
            res.clearCookie("access_token");
            res.clearCookie("refresh_token");
            console.log(error);
            res.status(200).json(this.apiResponse.format(null, error));
        }
    }
}

export default Middleware;