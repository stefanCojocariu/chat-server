import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, Request, Response, NextFunction } from 'express';

class ServerConfig {
	private app: Application;

	constructor(app: Application) {
		this.app = app;
	}

	include() {
		dotenv.config();
		this.app.use(express.json());
	}
}

export default ServerConfig;