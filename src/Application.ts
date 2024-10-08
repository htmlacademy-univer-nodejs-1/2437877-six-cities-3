import {logger} from './infrastructure/Logger.js';
import {Environments} from './infrastructure/Environments.js';

export class Application {
  public Init(){
    logger.info('App started');
    logger.info(`Server started on ${Environments.PORT} ${Environments.IP} ${Environments.SALT}`);
  }
}


const t = new Application();
t.Init();
