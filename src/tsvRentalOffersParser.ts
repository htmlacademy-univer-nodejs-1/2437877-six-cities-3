import * as readline from 'node:readline';
import * as fs from 'node:fs';
import {User} from './domain/user/User.js';
import {HousingType} from './domain/rent/HousingType.js';
import {Facility} from './domain/rent/Facilities.js';
import {UserType} from './domain/user/UserType.js';
import {Cities, City} from './domain/rent/City.js';


export class RentalOfferWithUser {
  title: string;
  description: string;
  publishDate: Date;
  city: City;
  previewImage: string;
  photos: string[];
  isPremium: boolean;
  rating: number;
  housingType: HousingType;
  rooms: number;
  guests: number;
  price: number;
  facilities: Facility[];
  author: User;
  coordinates: [number, number];

  constructor(title: string, description: string, publishDate: Date, city: City, previewImage: string, photos: string[], isPremium: boolean, rating: number, propertyType: HousingType, rooms: number, guests: number, price: number, amenities: Facility[], author: User, coordinates: [number, number]) {
    this.title = title;
    this.description = description;
    this.publishDate = publishDate;
    this.city = city;
    this.previewImage = previewImage;
    this.photos = photos;
    this.isPremium = isPremium;
    this.rating = rating;
    this.housingType = propertyType;
    this.rooms = rooms;
    this.guests = guests;
    this.price = price;
    this.facilities = amenities;
    this.author = author;
    this.coordinates = coordinates;
  }
}


export async function parseTsvToRentalOffers(filepath: string): Promise<RentalOfferWithUser[]> {
  const fileStream = fs.createReadStream(filepath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const rentalOffers: RentalOfferWithUser[] = [];

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
      rating,
      housingType,
      rooms,
      guests,
      price,
      facilities,
      authorId,
      authorName,
      authorEmail,
      authorPassword,
      authorUserType,
      authorAvatar,
      coordinates
    ] = line.split('\t');

    if(authorUserType !== UserType.Pro && authorUserType !== UserType.Regular){
      throw new Error('Invalid user type');
    }

    if(!Cities.includes(city as City)){
      throw new Error('Invalid city');
    }

    const author = new User(parseInt(authorId, 10), authorName, authorEmail, authorPassword, authorUserType, authorAvatar);

    const rentalOffer = new RentalOfferWithUser(
      title,
      description,
      new Date(publishDate),
      city as City,
      previewImage,
      photos.split(','),
      isPremium === 'true',
      Number(rating),
      housingType as HousingType,
      Number(rooms),
      Number(guests),
      Number(price),
      facilities.split(',') as Facility[],
      author,
      coordinates.split(',').map(Number) as [number, number]
    );

    rentalOffers.push(rentalOffer);
  }

  return rentalOffers;
}
