import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import {BaseController} from './baseController.js';
import {TYPES} from '../infrastructure/types.js';
import {IAuthService} from '../infrastructure/IAuthService.js';

@injectable()
export class AuthController extends BaseController {
  constructor(
    @inject(TYPES.AuthService) private authService: IAuthService,
  ) {
    super();
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { usernameOrEmail, password } = req.body;
      const token = await this.authService.login(usernameOrEmail, password);
      return this.sendOk(res, { token });
    } catch (error) {
      return this.sendUnauthorized(res, 'Invalid credentials');
    }
  }

  async logout(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if(token === undefined) {
        throw new Error();
      }

      await this.authService.logout(token);
      return this.sendOk(res, { message: 'Logged out successfully' });
    } catch (error) {
      return this.sendUnauthorized(res, 'Unable to logout');
    }
  }

  async checkStatus(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if(token === undefined) {
        throw new Error();
      }

      const user = await this.authService.validateToken(token);
      return this.sendOk(res, user);
    } catch (error) {
      return this.sendUnauthorized(res, 'Invalid token');
    }
  }
}
