import {HousingType} from './HousingType.js';
import {Facility} from './Facilities.js';
import {City} from './City.js';

export class RentalOffer {
  id: string;
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
  facilities: Facility[];
  authorId: string;
  commentsCount: number;
  coordinates: [number, number];

  constructor(id:string,title: string, description: string, publishDate: Date, city: City, previewImage: string, photos: string[], isPremium: boolean, isFavorite: boolean, rating: number, propertyType: HousingType, rooms: number, guests: number, price: number, amenities: Facility[], authorId: string, commentsCount: number, coordinates: [number, number]) {
    this.id = id;
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

