import {logger} from './infrastructure/Logger.js';

export class Application {
  public Init(){
    logger.info('App started');
  }
}


const t = new Application();
t.Init();
