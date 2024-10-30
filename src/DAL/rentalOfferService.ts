import { RentalOfferDbo, IRentalOffer } from './rentalOfferDbo.js';
import {IRentalOfferService, IUserService} from './databaseService.js';
import { injectable, inject } from 'inversify';
import { RentalOffer } from '../domain/rent/RentalOffer.js';
import {TYPES} from '../infrastructure/types.js';
import {CommentRepository} from './comment.repository.js';


@injectable()
export class RentalOfferService implements IRentalOfferService {
  constructor(
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.CommentRepository) private commentService: CommentRepository
  ) {}

  async findById(id: string): Promise<RentalOffer | null> {
    const offerData = await RentalOfferDbo.findById(id).exec();
    if (!offerData) {
      return null;
    }

    const author = await this.userService.findById(offerData.author.toString());
    if (!author) {
      throw new Error('Author not found');
    }

    const commentsCount = await this.commentService.countByOfferId(id);

    return new RentalOffer(
      offerData.title,
      offerData.description,
      offerData.publishDate,
      offerData.city,
      offerData.previewImage,
      offerData.photos,
      offerData.isPremium,
      offerData.isFavorite,
      offerData.rating,
      offerData.housingType,
      offerData.rooms,
      offerData.guests,
      offerData.price,
      offerData.facilities,
      author,
      commentsCount,
      offerData.coordinates
    );
  }

  async create(offer: Partial<IRentalOffer>): Promise<IRentalOffer> {
    const newOffer = new RentalOfferDbo(offer);
    return newOffer.save();
  }
}
