import * as readline from 'node:readline';
import * as fs from 'node:fs';
import {RentalOffer} from './domain/rent/RentalOffer.js';
import {User} from './domain/user/User.js';
import {HousingType} from './domain/rent/HousingType.js';
import {Facilities} from './domain/rent/Facilities.js';
import {UserType} from './domain/user/UserType.js';

export async function parseTsvToRentalOffers(filepath: string): Promise<RentalOffer[]> {
  const fileStream = fs.createReadStream(filepath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const rentalOffers: RentalOffer[] = [];

  for await (const line of rl) {
    const elements = line.split('\t');

    if(elements.length !== 17){
      continue;
    }

    const [
      title,
      description,
      publishDate,
      city,
      previewImage,
      photos,
      isPremium,
      isFavorite,
      rating,
      housingType,
      rooms,
      guests,
      price,
      facilities,
      authorId,
      commentsCount,
      coordinates
    ] = line.split('\t');

    const author = new User(authorId, 'main', 'psw', UserType.Pro);

    const rentalOffer = new RentalOffer(
      title,
      description,
      new Date(publishDate),
      city,
      previewImage,
      photos.split(','),
      isPremium === 'true',
      isFavorite === 'true',
      Number(rating),
      HousingType[housingType as keyof typeof HousingType],
      Number(rooms),
      Number(guests),
      Number(price),
      facilities.split(',') as Facilities[],
      author,
      Number(commentsCount),
      coordinates.split(',').map(Number) as [number, number]
    );

    rentalOffers.push(rentalOffer);
  }

  return rentalOffers;
}
