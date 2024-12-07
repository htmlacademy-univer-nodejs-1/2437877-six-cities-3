import 'reflect-metadata';
import {Container} from 'inversify';
import {ILogger} from './Logger/ILogger.js';
import {TYPES} from './types.js';
import {PinoLogger} from './Logger/PinoLogger.js';
import {Application} from '../Application.js';
import {IConfig} from './Config/IConfig.js';
import {Config} from './Config/Config.js';
import {DatabaseClient} from './Database/database-client.interface.js';
import {MongoDatabaseClient} from './Database/mongo-database-client.js';
import {RentalOfferService} from './DAL/rentalOfferService.js';
import {AuthController} from '../controllers/AuthController.js';
import {CommentRepository} from './DAL/comment.repository.js';
import {CommentController} from '../controllers/CommentController.js';
import {OfferController} from '../controllers/OfferController.js';
import {UserController} from '../controllers/UserController.js';
import {IAuthService} from './IAuthService.js';
import {AppExceptionFilter, ExceptionFilter} from './app-exeption-filter.js';
import {JWTAuthService} from './JWTAuthService.js';
import {CommentModel, IComment} from './DAL/comment.schema.js';
import {Model} from 'mongoose';
import {IUser, UserModel} from './DAL/user.model.js';
import {IRentalOffer, RentalOfferSchema} from './DAL/rentalOffer.schema.js';
import {UserRepository} from './DAL/user.repository.js';
import {AuthMiddleware} from '../middleware/auth.middleware.js';

export const container = new Container();
container.bind<ILogger>(TYPES.Logger).to(PinoLogger).inSingletonScope();
container.bind<Application>(TYPES.Application).to(Application).inSingletonScope();
container.bind<IConfig>(TYPES.Config).to(Config).inSingletonScope();
container.bind<DatabaseClient>(TYPES.DatabaseClient).to(MongoDatabaseClient).inSingletonScope();
container.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();
container.bind<OfferController>(TYPES.OfferController).to(OfferController).inSingletonScope();
container.bind<IAuthService>(TYPES.AuthService).to(JWTAuthService).inSingletonScope();
container.bind<ExceptionFilter>(TYPES.ExceptionFilter).to(AppExceptionFilter).inSingletonScope();
container.bind<UserRepository>(TYPES.UserService).to(UserRepository).inSingletonScope();


container.bind<UserController>(TYPES.OfferController).to(UserController).inSingletonScope();
container.bind<Model<IUser>>(TYPES.UserModel).toConstantValue(UserModel);

container.bind<CommentRepository>(TYPES.CommentRepository).to(CommentRepository).inSingletonScope();
container.bind<CommentController>(TYPES.CommentController).to(CommentController).inSingletonScope();
container.bind<Model<IComment>>(TYPES.CommentModel).toConstantValue(CommentModel);

container.bind<Model<IRentalOffer>>(TYPES.RentalOffer).toConstantValue(RentalOfferSchema);
container.bind<RentalOfferService>(TYPES.RentalOfferService).to(RentalOfferService).inSingletonScope();

container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware).inSingletonScope();
