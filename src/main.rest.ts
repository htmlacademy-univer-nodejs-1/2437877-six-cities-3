import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './infrastructure/types.js';
import {ILogger} from './infrastructure/Logger/ILogger.js';
import {PinoLogger} from './infrastructure/Logger/PinoLogger.js';
import {Application} from './Application.js';
import {Config} from './infrastructure/Config/Config.js';
import {IConfig} from './infrastructure/Config/IConfig.js';
import {DatabaseClient} from './infrastructure/Database/database-client.interface.js';
import {MongoDatabaseClient} from './infrastructure/Mongo/mongo-database-client.js';
import {IRentalOfferService, IUserService} from './DAL/databaseService.js';
import {UserService} from './DAL/userService.js';
import {RentalOfferService} from './DAL/rentalOfferService.js';

async function bootstrap() {
  const container = new Container();
  container.bind<ILogger>(TYPES.Logger).to(PinoLogger).inSingletonScope();
  container.bind<Application>(TYPES.Application).to(Application).inSingletonScope();
  container.bind<IConfig>(TYPES.Config).to(Config).inSingletonScope();
  container.bind<DatabaseClient>(TYPES.DatabaseClient).to(MongoDatabaseClient).inSingletonScope();
  container.bind<IUserService>(TYPES.UserService).to(UserService).inSingletonScope();
  container.bind<IRentalOfferService>(TYPES.RentalOfferService).to(RentalOfferService).inSingletonScope();

  const application = container.get<Application>(TYPES.Application);
  application.Init();
}

bootstrap();
