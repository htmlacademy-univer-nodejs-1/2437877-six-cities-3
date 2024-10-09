import {ILogger} from './infrastructure/Logger/ILogger.js';
import {inject, injectable} from 'inversify';
import {TYPES} from './types.js';
import {IConfig} from './infrastructure/Config/IConfig.js';

@injectable()
export class Application {
  constructor(
    @inject(TYPES.ILogger) private readonly logger: ILogger,
    @inject(TYPES.Config) private readonly config: IConfig
  ){

  }

  public Init(){
    this.logger.info('App started');
    this.logger.info(`Server started on ${this.config.port} ${this.config.dbip} ${this.config.salt}`);
  }
}
