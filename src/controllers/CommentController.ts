import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import {BaseController} from './baseController.js';
import {TYPES} from '../infrastructure/types.js';
import {IAuthService} from '../infrastructure/IAuthService.js';
import {CommentRepository} from '../DAL/comment.repository.js';

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(TYPES.CommentRepository) private commentService: CommentRepository,
    @inject(TYPES.AuthService) private authService: IAuthService
  ) {
    super();
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
