import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';

class ServerConfig {
	private app: Application;

	constructor(app: Application) {
		this.app = app;
	}

	include() {
		dotenv.config();
		this.app.use(express.json());
		this.app.use(cors());
        this.app.use(cookieParser());
	}
}

export default ServerConfig;