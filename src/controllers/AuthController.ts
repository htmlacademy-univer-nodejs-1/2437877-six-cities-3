import {Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/types.js';
import {IAuthService} from '../infrastructure/IAuthService.js';
import {HttpMethod} from './Common/http-method.enum.js';
import {ILogger} from '../infrastructure/Logger/ILogger.js';
import {AuthMiddleware} from '../middleware/auth.middleware.js';
import {UserType} from '../domain/user/UserType.js';
import {plainToInstance} from 'class-transformer';
import {CreateUserDto} from './Auth/CreateUserDto.js';
import {ControllerWithAuth} from './Common/controllerWithAuth.js';

@injectable()
export class AuthController extends ControllerWithAuth {
  constructor(
    @inject(TYPES.AuthService) private authServiceLocal: IAuthService,
    @inject(TYPES.AuthMiddleware) authMiddleware: AuthMiddleware,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(authServiceLocal, logger);
    this.addRoute({ path: '/login', method: HttpMethod.Post, handler: this.login });
    this.addRoute({ path: '/login', method: HttpMethod.Get, handler: this.checkStatus, middlewares: [authMiddleware] });
    this.addRoute({ path: '/register', method: HttpMethod.Post, handler: this.register });
    this.addRoute({ path: '/logout', method: HttpMethod.Delete, handler: this.logout, middlewares: [authMiddleware] });
    this.addRoute({ path: '/check-status', method: HttpMethod.Get, handler: this.checkStatus, middlewares: [authMiddleware] });
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      const token = await this.authServiceLocal.login(email, password);
      return this.sendOk(res, { token });
    } catch (error) {
      return this.sendUnauthorized(res, 'Invalid credentials');
    }
  }

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const createUser = plainToInstance(CreateUserDto, req.body);
      const { name, email, password, isPro } = createUser;
      const isProBoolean = isPro === 'on';
      const newUser = await this.authServiceLocal.register(name, email, password, '', isProBoolean ? UserType.Pro : UserType.Regular);

      return this.sendOk(res, { id: newUser._id, email: newUser.email, name: newUser.name, avatar:newUser.avatar, userType: newUser.userType });
    } catch (error) {
      return this.sendUnauthorized(res, 'Registration failed');
    }
  }

  async logout(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization;
      if(token === undefined) {
        throw new Error();
      }

      await this.authServiceLocal.logout(token);
      return this.sendOk(res, { message: 'Logged out successfully' });
    } catch (error) {
      return this.sendUnauthorized(res, 'Unable to logout');
    }
  }

  async checkStatus(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.getUserFromHeader(req, res);
      return this.sendOk(res, user);
    } catch (error) {
      return this.sendUnauthorized(res, 'Invalid token');
    }
  }
}
