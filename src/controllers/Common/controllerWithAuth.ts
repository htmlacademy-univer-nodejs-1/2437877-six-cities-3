import {BaseController} from "./baseController.js";
import {Request, Response} from "express";
import {IUser} from "../../infrastructure/DAL/user.model.js";
import {ILogger} from "../../infrastructure/Logger/ILogger.js";
import {IAuthService} from "../../infrastructure/IAuthService.js";

export abstract class ControllerWithAuth extends BaseController{
  constructor(
    private authService: IAuthService,
    readonly logger: ILogger
  ) {
    super(logger);
  }

  public async getUserFromHeader(req: Request, res: Response): Promise<IUser|null> {
    const token = req.headers.authorization?.split(' ')[1];
    if (token === undefined) {
      this.sendUnauthorized(res, 'Offer not found');
      return null;
    }

    const user = await this.authService.validateToken(token);
    return user;
  }
}
