import express from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../infrastructure/types.js';
import { AuthController } from './AuthController.js';
import { UserController } from './UserController.js';
import { OfferController } from './OfferController.js';
import { CommentController } from './CommentController.js';

@injectable()
export class RouteRegister {
  constructor(
    @inject(TYPES.AuthController) private authController: AuthController,
    @inject(TYPES.UserController) private userController: UserController,
    @inject(TYPES.OfferController) private offerController: OfferController,
    @inject(TYPES.CommentController) private commentController: CommentController
  ) {}

  registerRoutes(app: express.Application): void {
    this.registerAuthRoutes(app);
    this.registerUserRoutes(app);
    this.registerOfferRoutes(app);
    this.registerCommentRoutes(app);
  }

  private registerAuthRoutes(app: express.Application): void {
    app.post('/login', this.asyncHandler(this.authController.login));
    app.post('/logout', this.asyncHandler(this.authController.logout));
    app.get('/check-status', this.asyncHandler(this.authController.checkStatus));
  }

  private registerUserRoutes(app: express.Application): void {
    app.post('/users', this.asyncHandler(this.userController.create));
  }

  private registerOfferRoutes(app: express.Application): void {
    app.get('/offers', this.asyncHandler(this.offerController.getAll));
    app.get('/offers/:offerId', this.asyncHandler(this.offerController.getById));
    app.get('/offers/premium', this.asyncHandler(this.offerController.getPremium));

    app.post('/offers', this.asyncHandler(this.offerController.create));
    app.put('/offers/:offerId', this.asyncHandler(this.offerController.update));
    app.delete('/offers/:offerId', this.asyncHandler(this.offerController.delete));

    app.get('/offers/favorite', this.asyncHandler(this.offerController.getFavorite));
    app.post('/offers/:offerId/favorite', this.asyncHandler(this.offerController.addToFavorites));
    app.delete('/offers/:offerId/favorite', this.asyncHandler(this.offerController.removeFromFavorites));
  }

  private registerCommentRoutes(app: express.Application): void {
    app.get('/offers/:offerId/comments', this.asyncHandler(this.commentController.getComments));
    app.post('/offers/:offerId/comments', this.asyncHandler(this.commentController.addComment));
  }

  // Обновленный asyncHandler с корректной типизацией
  private asyncHandler(
    fn: (req: express.Request, res: express.Response) => Promise<express.Response>
  ) {
    return async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await fn.call(this, req, res);
      } catch (error) {
        next(error);
      }
    };
  }
}
