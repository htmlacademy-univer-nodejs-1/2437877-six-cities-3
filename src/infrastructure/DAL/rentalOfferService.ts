import { injectable } from 'inversify';
import { RentalOfferDbo, IRentalOffer } from './rentalOfferDbo.js';
import { RentalOffer } from '../../domain/rent/RentalOffer.js';
import { RentalOfferMapper } from '../../RentalOfferMapper.js';
import { Document } from 'mongoose';
import {UserDbo} from './userDbo.js';
import {IBaseService} from './IBaseService.js';

type MongoDocument = Document & {
  _id: unknown;
  toObject(): unknown;
};

type RentalOfferWithRating = IRentalOffer & MongoDocument & { rating: number };

@injectable()
export class RentalOfferService implements IBaseService{

  async exists(id: string): Promise<boolean> {
    return await this.findById(id) !== null;
  }

  async findById(id: string): Promise<RentalOffer | null> {
    const offerDbo = await RentalOfferDbo.findById(id).exec();
    if (!offerDbo) {
      return null;
    }

    const rating = await offerDbo.calculateRating();
    const offerWithRating = Object.assign(offerDbo, { rating }) as RentalOfferWithRating;

    return RentalOfferMapper.toDomain(offerWithRating);
  }

  async findAll(): Promise<RentalOffer[]> {
    const offersDbo = await RentalOfferDbo.find().exec();
    const offersWithRating = await Promise.all(
      offersDbo.map(async (offerDbo) => {
        const rating = await offerDbo.calculateRating();
        return Object.assign(offerDbo, { rating }) as RentalOfferWithRating;
      })
    );

    return offersWithRating.map(RentalOfferMapper.toDomain);
  }

  async create(offerData: Omit<IRentalOffer, keyof Document | 'calculateRating'>): Promise<RentalOffer> {
    const newOfferDbo = new RentalOfferDbo(offerData);
    const savedOffer = await newOfferDbo.save();
    const rating = await savedOffer.calculateRating();
    const offerWithRating = Object.assign(savedOffer, { rating }) as RentalOfferWithRating;

    return RentalOfferMapper.toDomain(offerWithRating);
  }

  async update(id: string, offerData: Partial<Omit<IRentalOffer, keyof Document | 'calculateRating'>>): Promise<RentalOffer | null> {
    const updatedOfferDbo = await RentalOfferDbo.findByIdAndUpdate(id, offerData, { new: true }).exec();
    if (!updatedOfferDbo) {
      return null;
    }

    const rating = await updatedOfferDbo.calculateRating();
    const offerWithRating = Object.assign(updatedOfferDbo, { rating }) as RentalOfferWithRating;

    return RentalOfferMapper.toDomain(offerWithRating);
  }

  async delete(id: string): Promise<boolean> {
    const result = await RentalOfferDbo.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async getPremiumByCity(city: string, limit: number = 3): Promise<RentalOffer[]> {
    const premiumOffersDbo = await RentalOfferDbo.find({
      city,
      premium: true
    })
      .limit(limit)
      .sort({ publicationDate: -1 })
      .exec();

    const offersWithRating = await Promise.all(
      premiumOffersDbo.map(async (offerDbo) => {
        const rating = await offerDbo.calculateRating();
        return Object.assign(offerDbo, { rating }) as RentalOfferWithRating;
      })
    );

    return offersWithRating.map(RentalOfferMapper.toDomain);
  }

  async getFavorites(userId: string): Promise<RentalOffer[]> {
    const user = await UserDbo.findById(userId).populate('favoriteOffers');

    if (!user) {
      return [];
    }

    const favoriteOffersDbo = await RentalOfferDbo.find({ author:  user._id }).exec();
    const offersWithRating = await Promise.all(
      favoriteOffersDbo.map(async (offerDbo) => {
        const rating = await offerDbo.calculateRating();
        return Object.assign(offerDbo, { rating }) as RentalOfferWithRating;
      })
    );

    return offersWithRating.map(RentalOfferMapper.toDomain);
  }

  async addToFavorites(offerId: string, userId: string): Promise<void> {
    await UserDbo.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteOffers: offerId } },
      { new: true }
    );
  }

  async removeFromFavorites(offerId: string, userId: string): Promise<void> {
    await UserDbo.findByIdAndUpdate(
      userId,
      { $pull: { favoriteOffers: offerId } },
      { new: true }
    );
  }

}
