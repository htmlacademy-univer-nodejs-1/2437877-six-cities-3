import { injectable } from 'inversify';
import { RentalOfferDbo, IRentalOffer } from './rentalOfferDbo.js';
import { RentalOffer } from '../domain/rent/RentalOffer.js';
import { RentalOfferMapper } from '../RentalOfferMapper.js';
import { Document } from 'mongoose';

// Определяем тип, который включает все свойства документа MongoDB
type MongoDocument = Document & {
  _id: unknown;
  toObject(): unknown;
};

// Определяем тип для объекта с рейтингом
type RentalOfferWithRating = IRentalOffer & MongoDocument & { rating: number };

@injectable()
export class RentalOfferService {
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
}
