import {RentalOffer} from '../domain/rent/RentalOffer.js';
import {RentalOfferWithRating} from '../infrastructure/DAL/rentalOfferService.js';

export class RentalOfferMapper {
  public static toDomain(offerDbo: RentalOfferWithRating): RentalOffer {
    return new RentalOffer(
      offerDbo._id.toString(),
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
      offerDbo.author.toString(),
      offerDbo.commentsCount,
      offerDbo.coordinates
    );
  }
}
