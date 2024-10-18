import {ILogger} from './infrastructure/Logger/ILogger.js';
import {inject, injectable} from 'inversify';
import {TYPES} from './infrastructure/types.js';
import {IConfig} from './infrastructure/Config/IConfig.js';
import {DatabaseClient} from './infrastructure/Database/database-client.interface.js';
import {getMongoURI} from './infrastructure/Database.js';

@injectable()
export class Application {
  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.Config) private readonly config: IConfig,
    @inject(TYPES.DatabaseClient) private readonly db:DatabaseClient,
  ){

  }

  public async Init(){
    this.logger.info('App started');
    this.logger.info(`Server started on ${this.config.port} ${this.config.dbip} ${this.config.salt}`);
    const url = getMongoURI(this.config.DB_USER, this.config.DB_PASSWORD,this.config.dbip, this.config.DB_PORT, this.config.DB_NAME);
    await this.db.connect(url);

  }
}
