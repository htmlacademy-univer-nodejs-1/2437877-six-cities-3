import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import {TYPES} from '../infrastructure/types.js';
import {IAuthService} from '../infrastructure/IAuthService.js';
import {CommentRepository} from '../infrastructure/DAL/comment.repository.js';
import {ILogger} from '../infrastructure/Logger/ILogger.js';
import {HttpMethod} from './Common/http-method.enum.js';
import {ValidateObjectIdMiddleware} from '../middleware/validate-objectid.middleware.js';
import {ControllerWithAuth} from './Common/controllerWithAuth.js';
import {AuthMiddleware} from '../middleware/auth.middleware.js';
import mongoose from 'mongoose';

@injectable()
export class CommentController extends ControllerWithAuth {
  constructor(
    @inject(TYPES.CommentRepository) private commentService: CommentRepository,
    @inject(TYPES.AuthService) authService: IAuthService,
    @inject(TYPES.AuthMiddleware) authMiddleware: AuthMiddleware,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(authService, logger);
    this.addRoute({ path: '/comments/:offerId', method: HttpMethod.Get, handler: this.getComments, middlewares: [new ValidateObjectIdMiddleware('offerId')] });
    this.addRoute({ path: '/comments/:offerId', method: HttpMethod.Post, handler: this.addComment, middlewares: [authMiddleware, new ValidateObjectIdMiddleware('offerId')] });
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
    const user = await this.getUserFromHeader(req, res);
    if(user === null){
      return res;
    }

    const offerId = req.params.offerId;
    const commentData = { ...req.body, authorId: user._id, offerId: offerId, publishDate: Date.now() };
    const comment = await this.commentService.create(commentData, new mongoose.Types.ObjectId(offerId));
    return this.sendCreated(res, comment);
  }
}
