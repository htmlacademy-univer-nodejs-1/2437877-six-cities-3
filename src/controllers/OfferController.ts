import {Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {IAuthService} from '../infrastructure/IAuthService.js';
import {TYPES} from '../infrastructure/types.js';
import {RentalOfferService} from '../infrastructure/DAL/rentalOfferService.js';
import {ILogger} from '../infrastructure/Logger/ILogger.js';
import {HttpMethod} from './Common/http-method.enum.js';
import {ValidateObjectIdMiddleware} from '../middleware/validate-objectid.middleware.js';
import {CheckExistMiddleware} from '../middleware/checkExist.middleware.js';
import {ControllerWithAuth} from "./Common/controllerWithAuth.js";


@injectable()
export class OfferController extends ControllerWithAuth {
  constructor(
    @inject(TYPES.RentalOfferService) private offerService: RentalOfferService,
    @inject(TYPES.AuthService) authService: IAuthService,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(authService, logger);
    const checkOfferExist = new CheckExistMiddleware(this.offerService, 'offerId');


    this.addRoute({ path: '/offers', method: HttpMethod.Get, handler: this.getAll });
    this.addRoute({ path: '/offers/:offerId', method: HttpMethod.Get, handler: this.getById, middlewares: [new ValidateObjectIdMiddleware('offerId')] });
    this.addRoute({ path: '/offers/premium', method: HttpMethod.Get, handler: this.getPremium });

    this.addRoute({ path: '/offers', method: HttpMethod.Post, handler: this.create });
    this.addRoute({ path: '/offers/:offerId', method: HttpMethod.Put, handler: this.update, middlewares: [new ValidateObjectIdMiddleware('offerId')] });
    this.addRoute({ path: '/offers/:offerId', method: HttpMethod.Delete, handler: this.delete, middlewares: [new ValidateObjectIdMiddleware('offerId'), checkOfferExist] });

    this.addRoute({ path: '/offers/favorite', method: HttpMethod.Get, handler: this.getFavorite });
    this.addRoute({ path: '/offers/:offerId/favorite', method: HttpMethod.Post, handler: this.addToFavorites, middlewares: [new ValidateObjectIdMiddleware('offerId')] });
    this.addRoute({ path: '/offers/:offerId/favorite', method: HttpMethod.Delete, handler: this.removeFromFavorites, middlewares: [new ValidateObjectIdMiddleware('offerId'), checkOfferExist] });
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 60;
      const offers = await this.offerService.findAll();
      return this.sendOk(res, offers.slice(0, limit));
    } catch (error:any) {
      return this.sendBadRequest(res, error.message);
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.getUserFromHeader(req, res);
      if(user === null){
        return res;
      }

      const offerData = { ...req.body, author: user.id };
      const offer = await this.offerService.create(offerData);
      return this.sendCreated(res, offer);
    } catch (error:any) {
      return this.sendUnauthorized(res, 'Authentication required');
    }
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
    } catch (error:any) {
      if (error.message === 'Forbidden') {
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

      await this.offerService.delete(offerId);
      return this.sendNoContent(res);
    } catch (error:any) {
      if (error.message === 'Forbidden') {
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

      const favoriteOffers = await this.offerService.getFavorites(user.id);
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
      await this.offerService.addToFavorites(offerId, user.id);
      return this.sendOk(res, { message: 'Offer added to favorites' });
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
      await this.offerService.removeFromFavorites(offerId, user.id);
      return this.sendOk(res, { message: 'Offer removed from favorites' });
    } catch (error) {
      return this.sendUnauthorized(res, 'Authentication required');
    }
  }
}
