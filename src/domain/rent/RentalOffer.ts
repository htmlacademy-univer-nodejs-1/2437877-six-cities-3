import {HousingType} from './HousingType.js';
import {Facilities} from './Facilities.js';
import {City} from './City.js';

export class RentalOffer {
  title: string;
  description: string;
  publishDate: Date;
  city: City;
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
  authorId: string;
  commentsCount: number;
  coordinates: [number, number];

  constructor(title: string, description: string, publishDate: Date, city: City, previewImage: string, photos: string[], isPremium: boolean, isFavorite: boolean, rating: number, propertyType: HousingType, rooms: number, guests: number, price: number, amenities: Facilities[], authorId: string, commentsCount: number, coordinates: [number, number]) {
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
    this.authorId = authorId;
    this.commentsCount = commentsCount;
    this.coordinates = coordinates;
  }
}

