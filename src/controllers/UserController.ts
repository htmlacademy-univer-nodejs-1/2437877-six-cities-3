import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import {BaseController} from './Common/baseController.js';
import {TYPES} from '../infrastructure/types.js';
import {ILogger} from '../infrastructure/Logger/ILogger.js';
import {HttpMethod} from './Common/http-method.enum.js';
import {IConfig} from '../infrastructure/Config/IConfig.js';
import {FileUploadMiddleware} from '../middleware/fileUpload.middleware.js';
import {UserRepository} from '../infrastructure/DAL/user.repository.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(TYPES.UserService) private userService: UserRepository,
    @inject(TYPES.Config) config: IConfig,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(logger);
    const fileUploadMiddleware = new FileUploadMiddleware(config, 'avatar');

    this.addRoute({ path: '/users', method: HttpMethod.Post, handler: this.create });
    this.addRoute({ path: '/:userId/avatar', method: HttpMethod.Post, handler: this.uploadAvatar, middlewares: [fileUploadMiddleware] });
  }

  async create(req: Request, res: Response): Promise<Response> {
    const userData = req.body;
    const user = await this.userService.create(userData);
    return this.sendCreated(res, user);
  }

  async uploadAvatar(req: Request, res: Response): Promise<Response> {
    const avatarFile = req.file;
    const userId = req.params.userId;
    if (!avatarFile) {
      return this.sendBadRequest(res, 'No file uploaded');
    }

    await this.userService.update(userId, {avatar: avatarFile.filename});

    return res.status(200).send();
  }
}
