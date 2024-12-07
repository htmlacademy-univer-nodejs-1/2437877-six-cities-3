export const TYPES = {
  Logger: Symbol.for('ILogger'),
  Application: Symbol.for('Application'),
  Config: Symbol.for('Config'),
  DatabaseClient: Symbol.for('DatabaseClient'),
  UserService: Symbol.for('IUserService'),
  UserDbo: Symbol.for('UserDbo'),

  RentalOfferService: Symbol.for('IRentalOfferService'),
  RentalOffer: Symbol.for('RentalOffer'),

  CommentModel: Symbol.for('CommentModel'),
  CommentRepository: Symbol.for('CommentRepository'),
  CommentController: Symbol.for('CommentController'),

  AuthService: Symbol.for('AuthService'),
  RouteRegister: Symbol.for('RouteRegister'),
  AuthController: Symbol.for('AuthController'),

  UserModel: Symbol.for('UserModel'),
  UserRepository: Symbol.for('UserRepository'),
  UserController: Symbol.for('UserController'),

  OfferController: Symbol.for('OfferController'),
  ExceptionFilter: Symbol.for('ExceptionFilter')
};
