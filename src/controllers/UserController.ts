import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import {BaseController} from './baseController.js';
import {TYPES} from '../infrastructure/types.js';
import {IUserService} from '../DAL/databaseService.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(TYPES.UserService) private userService: IUserService
  ) {
    super();
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
