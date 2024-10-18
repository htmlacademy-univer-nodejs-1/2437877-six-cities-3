import { RentalOfferDbo, IRentalOffer } from './rentalOfferDbo.js';
import {IRentalOfferService} from './databaseService.js';
import {injectable} from 'inversify';

@injectable()
export class RentalOfferService implements IRentalOfferService {
  async findById(id: string): Promise<IRentalOffer | null> {
    return RentalOfferDbo.findById(id).exec();
  }

  async create(offer: Partial<IRentalOffer>): Promise<IRentalOffer> {
    const newOffer = new RentalOfferDbo(offer);
    return newOffer.save();
  }
}
