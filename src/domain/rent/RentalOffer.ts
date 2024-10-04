import {HousingType} from './HousingType.js';
import {User} from '../user/User.js';
import {Facilities} from './Facilities.js';

export class RentalOffer {
  title: string;
  description: string;
  publishDate: Date;
  city: string;
  previewImage: string;
  photos: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  housingType: HousingType;
  rooms: number;
  guests: number;
  price: number;
  facilities: Facilities[];
  author: User;
  commentsCount: number;
  coordinates: [number, number];

  constructor(title: string, description: string, publishDate: Date, city: string, previewImage: string, photos: string[], isPremium: boolean, isFavorite: boolean, rating: number, propertyType: HousingType, rooms: number, guests: number, price: number, amenities: Facilities[], author: User, commentsCount: number, coordinates: [number, number]) {
    this.title = title;
    this.description = description;
    this.publishDate = publishDate;
    this.city = city;
    this.previewImage = previewImage;
    this.photos = photos;
    this.isPremium = isPremium;
    this.isFavorite = isFavorite;
    this.rating = rating;
    this.housingType = propertyType;
    this.rooms = rooms;
    this.guests = guests;
    this.price = price;
    this.facilities = amenities;
    this.author = author;
    this.commentsCount = commentsCount;
    this.coordinates = coordinates;
  }
}

