import {HousingType} from './HousingType.js';
import {City as CityName} from './City.js';

export type Location = {
  latitude: number;
  longitude: number;
};

export type City = {
  name: CityName;
  location: Location;
};

export type OfferDto = {
  title: string;
  description: string;
  city: City;
  previewImage: string;
  isPremium: boolean;
  type: HousingType;
  bedrooms: number;
  maxAdults: number;
  price: number;
  goods: string[];
  location: Location;
};
