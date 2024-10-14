import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types.js';
import {ILogger} from './infrastructure/Logger/ILogger.js';
import {PinoLogger} from './infrastructure/Logger/PinoLogger.js';
import {Application} from './Application.js';
import {Config} from './infrastructure/Config/Config.js';
import {IConfig} from './infrastructure/Config/IConfig.js';

async function bootstrap() {
  const container = new Container();
  container.bind<ILogger>(TYPES.ILogger).to(PinoLogger).inSingletonScope();
  container.bind<Application>(TYPES.Application).to(Application).inSingletonScope();
  container.bind<IConfig>(TYPES.Config).to(Config).inSingletonScope();

  const application = container.get<Application>(TYPES.Application);
  application.Init();
}

bootstrap();
