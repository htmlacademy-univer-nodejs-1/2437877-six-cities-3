import {logger} from './infrastructure/Logger.js';
import {config} from './infrastructure/Schema.js';

export class Application {
  public Init(){
    logger.info('App started');
    logger.info(`Server started on ${config.port} ${config.dbip} ${config.salt}`);
  }
}


const t = new Application();
t.Init();
