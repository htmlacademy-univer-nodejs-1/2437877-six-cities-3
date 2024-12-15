import 'reflect-metadata';
import express, {
  Express,
  NextFunction,
  Request,
  Response
} from 'express';

import { inject, injectable } from 'inversify';
import multer from 'multer';
import { ILogger } from './infrastructure/Logger/ILogger.js';
import { TYPES } from './infrastructure/types.js';
import { IConfig } from './infrastructure/Config/IConfig.js';
import { DatabaseClient } from './infrastructure/Database/database-client.interface.js';
import { getMongoURI } from './infrastructure/Database.js';
import {AuthController} from './controllers/AuthController.js';
import {UserController} from './controllers/UserController.js';
import {OfferController} from './controllers/OfferController.js';
import {CommentController} from './controllers/CommentController.js';
import {ExceptionFilter} from './infrastructure/app-exeption-filter.js';
import path from 'node:path';
import cors from 'cors';

@injectable()
export class Application {
  private readonly server: Express;

  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.Config) private readonly config: IConfig,
    @inject(TYPES.DatabaseClient) private readonly db: DatabaseClient,
    @inject(TYPES.AuthController) private authController: AuthController,
    @inject(TYPES.UserController) private userController: UserController,
    @inject(TYPES.OfferController) private offerController: OfferController,
    @inject(TYPES.CommentController) private commentController: CommentController,
    @inject(TYPES.ExceptionFilter) private readonly appExceptionFilter: ExceptionFilter,
  ) {
    this.server = express();

    this.initializeMiddleware();
  }

  private async _initServer() {
    const port = this.config.port;
    this.server.listen(port);
  }

  private initializeMiddleware(): void {
    this.server.use(express.json({
      limit: '10mb',
      strict: true,
      type: 'application/json'
    }));

    this.server.use(express.urlencoded({
      extended: true,
      limit: '10mb'
    }));

    this.server.use((req: Request, _: Response, next: NextFunction) => {
      this.logger.info(`[${req.method}] ${req.path}`);
      next();
    });
    const fileMiddleware = express.static(path.join(path.resolve(), this.config.UPLOAD_DIR));
    this.server.use('/uploads', fileMiddleware);
  }

  public async Init(): Promise<void> {
    this.logger.info('App initializing');

    const url = getMongoURI(
      this.config.DB_USER,
      this.config.DB_PASSWORD,
      this.config.dbip,
      this.config.DB_PORT,
      this.config.DB_NAME
    );

    await this.db.connect(url);

    this.logger.info('Init database completed');

    this.logger.info('Init app-level middleware');
    await this._initMiddleware();
    this.logger.info('App-level middleware initialization completed');

    this.logger.info('Init controllers');
    await this._initControllers();
    this.logger.info('Controller initialization completed');

    this.logger.info('Init exception filters');
    await this._initExceptionFilters();
    this.logger.info('Exception filters initialization compleated');

    this.logger.info('Try to init server…');
    await this._initServer();
    this.logger.info(`🚀 Server started on http://localhost:${this.config.port}`);
  }

  private async _initControllers() {
    this.server.use('/', this.authController.router);
    this.server.use('/', this.userController.router);
    this.server.use('/', this.offerController.router);
    this.server.use('/', this.commentController.router);


    const storage = multer.diskStorage({
      destination: (_, __, cb) => {
        cb(null, this.config.UPLOAD_DIR);
      },
      filename: (_, file, cb) => {
        cb(null, file.originalname);
      },
    });

    const upload = multer({ storage });

    this.server.post('/upload', upload.single('file'), (req, res) => {
      res.status(200).json({ message: 'File uploaded successfully', file: req.file });
    });
  }

  private async _initMiddleware() {
    this.server.use(express.json());
    this.server.use(cors());
  }

  private async _initExceptionFilters() {
    this.server.use(this.appExceptionFilter.catch.bind(this.appExceptionFilter));
  }
}
