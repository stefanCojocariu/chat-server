import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { Application, Request, Response, NextFunction } from 'express';

class ServerConfig {
	private app: Application;

	constructor(app: Application) {
		this.app = app;
	}

	include() {
		dotenv.config();
		this.app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
		this.app.use(cookieParser());
		this.app.use(express.json());
	}
}

export default ServerConfig;