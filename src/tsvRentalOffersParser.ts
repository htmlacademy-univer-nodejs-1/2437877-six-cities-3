import * as readline from 'node:readline';
import * as fs from 'node:fs';
import {RentalOffer} from './domain/rent/RentalOffer.js';
import {User} from './domain/user/User.js';
import {HousingType} from './domain/rent/HousingType.js';
import {Facilities} from './domain/rent/Facilities.js';
import {UserType} from './domain/user/UserType.js';
import {City} from './domain/rent/City.js';

export async function parseTsvToRentalOffers(filepath: string): Promise<RentalOffer[]> {
  const fileStream = fs.createReadStream(filepath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const rentalOffers: RentalOffer[] = [];

  for await (const line of rl) {
    const elements = line.split('\t');

    if(elements.length !== 21){
      console.error(`Invalid number of elements in line: ${line}`);
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
      authorUserType,
      authorAvatar,
      authorEmail,
      authorPassword,
      commentsCount,
      coordinates
    ] = line.split('\t');

    if(authorUserType !== UserType.Pro && authorUserType !== UserType.Regular){
      throw new Error('Invalid user type');
    }

    if(!Object.values(City).map((x)=>x.toString()).includes(city as City)){
      throw new Error('Invalid city');
    }

    const author = new User(authorId, authorEmail, authorPassword, authorUserType, authorAvatar);

    const rentalOffer = new RentalOffer(
      title,
      description,
      new Date(publishDate),
      city as City,
      previewImage,
      photos.split(','),
      isPremium === 'true',
      isFavorite === 'true',
      Number(rating),
      housingType as HousingType,
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
