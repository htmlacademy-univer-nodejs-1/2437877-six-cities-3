import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import {BaseController} from './baseController.js';
import {IAuthService} from '../infrastructure/IAuthService.js';
import {TYPES} from '../infrastructure/types.js';
import {RentalOfferService} from '../DAL/rentalOfferService.js';


@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(TYPES.RentalOfferService) private offerService: RentalOfferService,
    @inject(TYPES.AuthService) private authService: IAuthService
  ) {
    super();
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
      const token = req.headers.authorization?.split(' ')[1];
      if(token === undefined) {
        throw new Error();
      }

      const user = await this.authService.validateToken(token);
      const offerData = { ...req.body, author: user.id };
      const offer = await this.offerService.create(offerData);
      return this.sendCreated(res, offer);
    } catch (error:any) {
      return this.sendUnauthorized(res, 'Authentication required');
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if(token === undefined) {
        throw new Error();
      }

      await this.authService.validateToken(token);
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
      const token = req.headers.authorization?.split(' ')[1];
      if(token === undefined) {
        throw new Error();
      }

      await this.authService.validateToken(token);
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
      const token = req.headers.authorization?.split(' ')[1];
      if(token === undefined) {
        throw new Error();
      }

      const user = await this.authService.validateToken(token);
      const favoriteOffers = await this.offerService.getFavorites(user.id);
      return this.sendOk(res, favoriteOffers);
    } catch (error) {
      return this.sendUnauthorized(res, 'Authentication required');
    }
  }

  async addToFavorites(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if(token === undefined) {
        throw new Error();
      }

      const user = await this.authService.validateToken(token);
      const offerId = req.params.offerId;
      await this.offerService.addToFavorites(offerId, user.id);
      return this.sendOk(res, { message: 'Offer added to favorites' });
    } catch (error) {
      return this.sendUnauthorized(res, 'Authentication required');
    }
  }

  async removeFromFavorites(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if(token === undefined) {
        throw new Error();
      }

      const user = await this.authService.validateToken(token);
      const offerId = req.params.offerId;
      await this.offerService.removeFromFavorites(offerId, user.id);
      return this.sendOk(res, { message: 'Offer removed from favorites' });
    } catch (error) {
      return this.sendUnauthorized(res, 'Authentication required');
    }
  }
}
