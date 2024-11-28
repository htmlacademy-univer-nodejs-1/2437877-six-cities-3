import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import {BaseController} from './baseController.js';
import {TYPES} from '../infrastructure/types.js';
import {IAuthService} from '../infrastructure/IAuthService.js';
import {CommentRepository} from '../DAL/comment.repository.js';
import {ILogger} from '../infrastructure/Logger/ILogger.js';
import {HttpMethod} from './http-method.enum.js';
import {ValidateObjectIdMiddleware} from "../middleware/validate-objectid.middleware.js";

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(TYPES.CommentRepository) private commentService: CommentRepository,
    @inject(TYPES.AuthService) private authService: IAuthService,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(logger);
    this.addRoute({ path: '/offers/:offerId/comments', method: HttpMethod.Get, handler: this.getComments, middlewares: [new ValidateObjectIdMiddleware("offerId")] });
    this.addRoute({ path: '/offers/:offerId/comments', method: HttpMethod.Post, handler: this.addComment, middlewares: [new ValidateObjectIdMiddleware("offerId")] });
  }

  async getComments(req: Request, res: Response): Promise<Response> {
    try {
      const offerId = req.params.offerId;
      const comments = await this.commentService.findByOfferId(offerId);
      return this.sendOk(res, comments);
    } catch (error) {
      return this.sendNotFound(res, 'Offer not found');
    }
  }

  async addComment(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if(token === undefined) {
        throw new Error();
      }

      const user = await this.authService.validateToken(token);
      const offerId = req.params.offerId;
      const commentData = { ...req.body, author: user.id };
      const comment = await this.commentService.create(commentData, offerId);
      return this.sendCreated(res, comment);
    } catch (error) {
      return this.sendUnauthorized(res, 'Authentication required');
    }
  }
}
