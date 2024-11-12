import 'reflect-metadata';
import express, {
  Application as ExpressApplication,
  NextFunction,
  Request,
  Response
} from 'express';
import http from 'node:http';
import { inject, injectable } from 'inversify';

import { ILogger } from './infrastructure/Logger/ILogger.js';
import { TYPES } from './infrastructure/types.js';
import { IConfig } from './infrastructure/Config/IConfig.js';
import { DatabaseClient } from './infrastructure/Database/database-client.interface.js';
import { getMongoURI } from './infrastructure/Database.js';
import { RouteRegister } from "./controllers/RouteRegister.js";

interface ErrorWithStatus extends Error {
  status?: number;
}

@injectable()
export class Application {
  private readonly expressApp: ExpressApplication;
  private readonly httpServer: http.Server;

  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.Config) private readonly config: IConfig,
    @inject(TYPES.DatabaseClient) private readonly db: DatabaseClient,
    @inject(TYPES.RouteRegister) private readonly routeRegister: RouteRegister,
  ) {
    this.expressApp = express();
    this.httpServer = http.createServer(this.expressApp);

    this.initializeMiddleware();
  }

  private initializeMiddleware(): void {
    this.expressApp.use(express.json({
      limit: '10mb',
      strict: true,
      type: 'application/json'
    }));

    this.expressApp.use(express.urlencoded({
      extended: true,
      limit: '10mb'
    }));

    this.expressApp.use((req: Request, _: Response, next: NextFunction) => {
      this.logger.info(`[${req.method}] ${req.path}`);
      next();
    });
  }

  public async Init(): Promise<void> {
    try {
      this.logger.info('App initializing');

      // Database connection
      const url = getMongoURI(
        this.config.DB_USER,
        this.config.DB_PASSWORD,
        this.config.dbip,
        this.config.DB_PORT,
        this.config.DB_NAME
      );
      await this.db.connect(url);

      // Register routes
      this.routeRegister.registerRoutes(this.expressApp);

      // Error handling middleware
      this.registerErrorHandling();

      // Start server
      this.httpServer.listen(this.config.port, () => {
        this.logger.info(`Server running on port ${this.config.port}`);
      });
    } catch (error) {
      this.logger.error('Failed to initialize application', error as Error);
      process.exit(1);
    }
  }

  private registerErrorHandling(): void {
    this.expressApp.use((req: Request, res: Response) => {
      res.status(404).json({
        message: 'Not Found',
        path: req.path
      });
    });

    this.expressApp.use(this.errorHandler);
  }

  private errorHandler(
    err: ErrorWithStatus,
    _: Request,
    res: Response,
  ) {


    this.logger.error(`Error: ${err.message}`, err);
    const status = err.status || 500;

    const errorResponse = {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };

    switch (err.name) {
      case 'ValidationError':
         res.status(400).json({
          message: 'Validation Error',
          errors: (err as any).errors
        });
         break;
      case 'UnauthorizedError':
         res.status(401).json({ message: 'Unauthorized' });
         break;
      case 'ForbiddenError':
         res.status(403).json({ message: 'Forbidden' });
         break;
      default:
         res.status(status).json(errorResponse);
    }
  }

  public async close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.httpServer) {
        this.httpServer.close((err) => {
          if (err) {
            this.logger.error('Error closing server', err);
            reject(err);
          } else {
            this.logger.info('Server closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}
