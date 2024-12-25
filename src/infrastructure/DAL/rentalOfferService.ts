import {inject, injectable} from 'inversify';
import { RentalOfferSchema, IRentalOffer } from './rentalOffer.schema.js';
import { RentalOffer } from '../../domain/rent/RentalOffer.js';
import { RentalOfferMapper } from '../../mappers/RentalOfferMapper.js';
import mongoose, {Document, Model, Types} from 'mongoose';
import {IUser} from './user.model.js';
import {IBaseService} from './IBaseService.js';
import {TYPES} from '../types.js';
import {OfferDto} from '../../domain/rent/offerDto.js';


type RentalOfferWithRating = IRentalOffer & { rating: number };

@injectable()
export class RentalOfferService implements IBaseService{
  constructor(
    @inject(TYPES.RentalOffer) private readonly rentalOfferModel: Model<IRentalOffer>,
    @inject(TYPES.UserModel) private userModel: Model<IUser>,
  ) {}

  async exists(id: string): Promise<boolean> {
    return await this.findById(id) !== null;
  }

  async findById(id: string): Promise<RentalOffer | null> {
    const offerDbo = await this.rentalOfferModel.findById(id).exec();
    if (!offerDbo) {
      return null;
    }

    const rating = await offerDbo.calculateRating();
    const offerWithRating = Object.assign(offerDbo, { rating }) as RentalOfferWithRating;

    return RentalOfferMapper.toDomain(offerWithRating);
  }

  async findAll(): Promise<RentalOffer[]> {
    const offersDbo = await this.rentalOfferModel.find().exec();
    const offersWithRating = await Promise.all(
      offersDbo.map(async (offerDbo) => {
        const rating = await offerDbo.calculateRating();
        return Object.assign(offerDbo, { rating }) as RentalOfferWithRating;
      })
    );

    return offersWithRating.map(RentalOfferMapper.toDomain);
  }

  async create(authorId:mongoose.Types.ObjectId, offerData: OfferDto): Promise<RentalOffer> {
    const newOfferDbo = new RentalOfferSchema({
      _id: new mongoose.Types.ObjectId(),
      title: offerData.title,
      description: offerData.description,
      publishDate: Date.now(),
      city: offerData.city.name,
      previewImage: offerData.previewImage,
      photos: [],
      isPremium: offerData.isPremium,
      housingType: offerData.type,
      bed: offerData.bedrooms,
      author: authorId,
      rooms: offerData.bedrooms,
      guests: offerData.maxAdults,
      price: offerData.price,
      coordinates: [offerData.location.latitude, offerData.location.longitude]
    });
    const savedOffer = await newOfferDbo.save();
    const rating = await savedOffer.calculateRating();
    const offerWithRating = Object.assign(savedOffer, { rating }) as RentalOfferWithRating;

    return RentalOfferMapper.toDomain(offerWithRating);
  }

  async update(id: string, offerData: Partial<Omit<IRentalOffer, keyof Document | 'calculateRating'>>): Promise<RentalOffer | null> {
    const updatedOfferDbo = await this.rentalOfferModel.findByIdAndUpdate(id, offerData, { new: true }).exec();
    if (!updatedOfferDbo) {
      return null;
    }

    const rating = await updatedOfferDbo.calculateRating();
    const offerWithRating = Object.assign(updatedOfferDbo, { rating }) as RentalOfferWithRating;

    return RentalOfferMapper.toDomain(offerWithRating);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.rentalOfferModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async getPremiumByCity(city: string, limit: number = 3): Promise<RentalOffer[]> {
    const premiumOffersDbo = await this.rentalOfferModel.find({
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

  async getFavorites(userId: Types.ObjectId): Promise<RentalOffer[]> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      return [];
    }

    const favoriteOffersDbo = await this.rentalOfferModel.find({ _id: { $in: user.favoriteOffers } }).exec();

    const offersWithRating = await Promise.all(
      favoriteOffersDbo.map(async (offerDbo) => {
        const rating = await offerDbo.calculateRating();
        const offer = Object.assign(offerDbo, { rating }) as RentalOfferWithRating;
        offer.isFavorite = true;
        return offer;
      })
    );

    return offersWithRating.map(RentalOfferMapper.toDomain);
  }

  async addToFavorites(offerId: string, userId: Types.ObjectId): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteOffers: offerId } },
      { new: true }
    );
  }

  async removeFromFavorites(offerId: string, userId: Types.ObjectId): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { favoriteOffers: offerId } },
      { new: true }
    );
  }

}
