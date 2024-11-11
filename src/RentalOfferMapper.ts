import {IRentalOffer} from './DAL/rentalOfferDbo.js';
import {RentalOffer} from './domain/rent/RentalOffer.js';

export class RentalOfferMapper {
  public static toDomain(offerDbo: IRentalOffer & { rating: number }): RentalOffer {
    return new RentalOffer(
      offerDbo.title,
      offerDbo.description,
      offerDbo.publishDate,
      offerDbo.city,
      offerDbo.previewImage,
      offerDbo.photos,
      offerDbo.isPremium,
      offerDbo.isFavorite,
      offerDbo.rating,
      offerDbo.housingType,
      offerDbo.rooms,
      offerDbo.guests,
      offerDbo.price,
      offerDbo.facilities,
      offerDbo.author._id.toString(),
      offerDbo.commentsCount,
      offerDbo.coordinates
    );
  }
}
