import {Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {IAuthService} from '../infrastructure/IAuthService.js';
import {TYPES} from '../infrastructure/types.js';
import {RentalOfferService} from '../infrastructure/DAL/rentalOfferService.js';
import {ILogger} from '../infrastructure/Logger/ILogger.js';
import {HttpMethod} from './Common/http-method.enum.js';
import {ValidateObjectIdMiddleware} from '../middleware/validate-objectid.middleware.js';
import {CheckExistMiddleware} from '../middleware/checkExist.middleware.js';
import {ControllerWithAuth} from './Common/controllerWithAuth.js';
import {AuthMiddleware} from '../middleware/auth.middleware.js';
import mongoose from 'mongoose';


@injectable()
export class OfferController extends ControllerWithAuth {
  constructor(
    @inject(TYPES.RentalOfferService) private offerService: RentalOfferService,
    @inject(TYPES.AuthService) authServiceLocal: IAuthService,
    @inject(TYPES.AuthMiddleware) authMiddleware: AuthMiddleware,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(authServiceLocal, logger);
    const checkOfferExist = new CheckExistMiddleware(this.offerService, 'offerId');


    this.addRoute({ path: '/offers', method: HttpMethod.Get, handler: this.getAll });
    this.addRoute({ path: '/offers/premium', method: HttpMethod.Get, handler: this.getPremium, middlewares: [] });
    this.addRoute({ path: '/offers/:offerId', method: HttpMethod.Get, handler: this.getById, middlewares: [new ValidateObjectIdMiddleware('offerId')] });

    this.addRoute({ path: '/offers', method: HttpMethod.Post, handler: this.create, middlewares: [authMiddleware] });
    this.addRoute({ path: '/offers/:offerId', method: HttpMethod.Put, handler: this.update, middlewares: [authMiddleware, new ValidateObjectIdMiddleware('offerId'), checkOfferExist] });
    this.addRoute({ path: '/offers/:offerId', method: HttpMethod.Delete, handler: this.delete, middlewares: [authMiddleware, new ValidateObjectIdMiddleware('offerId'), checkOfferExist] });

    this.addRoute({ path: '/favorite', method: HttpMethod.Get, handler: this.getFavorite });
    this.addRoute({ path: '/favorite/:offerId', method: HttpMethod.Post, handler: this.addToFavorites, middlewares: [authMiddleware, new ValidateObjectIdMiddleware('offerId')] });
    this.addRoute({ path: '/favorite/:offerId', method: HttpMethod.Delete, handler: this.removeFromFavorites, middlewares: [authMiddleware, new ValidateObjectIdMiddleware('offerId'), checkOfferExist] });
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.getUserFromHeader(req, res);
      const favoriteOffers = await this.offerService.getFavorites(user!._id);

      const limit = parseInt(req.query.limit as string, 10) || 60;
      const offers = await this.offerService.findAll();
      return this.sendOk(res, offers.concat(favoriteOffers)
        .filter((offer, index, self) => index === self.findIndex((o) => o.title === offer.title))
        .slice(0, limit));
    } catch (error) {
      return this.sendBadRequest(res, (error as Error).message);
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    const user = await this.getUserFromHeader(req, res);
    if(user === null){
      return res;
    }

    const offerData = req.body;
    const offer = await this.offerService.create(user._id, offerData);
    return this.sendCreated(res, offer);
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.getUserFromHeader(req, res);
      if(user === null){
        return res;
      }

      const offerId = req.params.offerId;
      const offerData = req.body;

      const updatedOffer = await this.offerService.update(offerId, offerData);
      return this.sendOk(res, updatedOffer);
    } catch (error) {
      if ((error as Error).message === 'Forbidden') {
        return this.sendForbidden(res, 'Can only update own offers');
      }
      return this.sendUnauthorized(res, 'Authentication required');
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.getUserFromHeader(req, res);
      if(user === null){
        return res;
      }

      const offerId = req.params.offerId;

      const result = await this.offerService.delete(new mongoose.Types.ObjectId(offerId), user._id);
      return this.sendOk(res, result);
    } catch (error) {
      if ((error as Error).message === 'Forbidden') {
        return this.sendForbidden(res, 'Can only delete own offers');
      }
      return this.sendUnauthorized(res, 'Authentication required');
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const offerId = req.params.offerId;
      const offer = await this.offerService.findById(offerId);
      return this.sendOk(res, offer);
    } catch (error) {
      return this.sendNotFound(res, 'Offer not found');
    }
  }

  async getPremium(req: Request, res: Response): Promise<Response> {
    try {
      const city = req.query.city as string;
      const premiumOffers = await this.offerService.getPremiumByCity(city);
      return this.sendOk(res, premiumOffers);
    } catch (error) {
      return this.sendNotFound(res, 'No premium offers found');
    }
  }

  async getFavorite(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.getUserFromHeader(req, res);
      if(user === null){
        return res;
      }

      const favoriteOffers = await this.offerService.getFavorites(user._id);
      return this.sendOk(res, favoriteOffers);
    } catch (error) {
      return this.sendUnauthorized(res, 'Authentication required');
    }
  }

  async addToFavorites(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.getUserFromHeader(req, res);
      if(user === null){
        return res;
      }

      const offerId = req.params.offerId;
      await this.offerService.addToFavorites(offerId, user._id);
      return this.sendOk(res, {});
    } catch (error) {
      return this.sendUnauthorized(res, 'Authentication required');
    }
  }

  async removeFromFavorites(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.getUserFromHeader(req, res);
      if(user === null){
        return res;
      }

      const offerId = req.params.offerId;
      await this.offerService.removeFromFavorites(offerId, user._id);
      return this.sendOk(res, {});
    } catch (error) {
      return this.sendUnauthorized(res, 'Authentication required');
    }
  }
}
