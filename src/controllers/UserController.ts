import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import {BaseController} from './Common/baseController.js';
import {TYPES} from '../infrastructure/types.js';
import {IUserService} from '../infrastructure/DAL/userService.interface.js';
import {ILogger} from '../infrastructure/Logger/ILogger.js';
import {HttpMethod} from './Common/http-method.enum.js';
import {IConfig} from '../infrastructure/Config/IConfig.js';
import {FileUploadMiddleware} from '../middleware/fileUpload.middleware.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.Config) config: IConfig,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(logger);
    const fileUploadMiddleware = new FileUploadMiddleware(config, 'photo');

    this.addRoute({ path: '/users', method: HttpMethod.Post, handler: this.create, middlewares: [fileUploadMiddleware] });
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const userData = req.body;
      const user = await this.userService.create(userData);
      return this.sendCreated(res, user);
    } catch (error:any) {
      if (error.code === 11000) {
        return this.sendConflict(res, 'User with this email already exists');
      }
      return this.sendBadRequest(res, error.message);
    }
  }
}
