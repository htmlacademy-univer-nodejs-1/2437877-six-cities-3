import 'reflect-metadata';
import express, { Application as ExpressApplication } from 'express';
import {ILogger} from './infrastructure/Logger/ILogger.js';
import {inject, injectable} from 'inversify';
import {TYPES} from './infrastructure/types.js';
import {IConfig} from './infrastructure/Config/IConfig.js';
import {DatabaseClient} from './infrastructure/Database/database-client.interface.js';
import {getMongoURI} from './infrastructure/Database.js';
import http from 'node:http';

@injectable()
export class Application {
  private readonly expressApp: ExpressApplication;
  private readonly httpServer: http.Server;

  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.Config) private readonly config: IConfig,
    @inject(TYPES.DatabaseClient) private readonly db: DatabaseClient,
  ) {
    this.expressApp = express();
    this.expressApp.use(express.json());
    this.httpServer = http.createServer(this.expressApp);
  }

  public async Init() {
    try {
      this.logger.info('App started');
      this.logger.info(`Server started on port: ${this.config.port}, DB IP: ${this.config.dbip}`);

      const url = getMongoURI(
        this.config.DB_USER,
        this.config.DB_PASSWORD,
        this.config.dbip,
        this.config.DB_PORT,
        this.config.DB_NAME
      );
      await this.db.connect(url);
      this.httpServer.listen(this.config.port, () => {
        this.logger.info(`Server running on port ${this.config.port}`);
      });

    } catch (error) {
      this.logger.error('Failed to initialize application', error as Error);
      throw error;
    }
  }

  public async close() {
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
