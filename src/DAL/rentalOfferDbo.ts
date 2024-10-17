import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './userDbo.js';
import {Facilities} from '../domain/rent/Facilities.js';
import {HousingType} from '../domain/rent/HousingType.js';

export interface IRentalOffer extends Document {
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
  author: IUser['_id'];
  commentsCount: number;
  coordinates: [number, number];
}

const RentalOfferSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 1024
  },
  publishDate: {
    type: Date,
    required: true
  },
  city: {
    type: String,
    required: true,
    enum: ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf']
  },
  previewImage: {
    type: String,
    required: true
  },
  photos: {
    type: [String],
    required: true,
  },
  isPremium: {
    type: Boolean,
    required: true
  },
  isFavorite: {
    type: Boolean,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  housingType: {
    type: String,
    required: true,
    enum: Object.values(HousingType)
  },
  rooms: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  price: {
    type: Number,
    required: true,
    min: 100,
    max: 100000
  },
  facilities: {
    type: [String],
    required: true,
    enum: Object.values(Facilities)
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  coordinates: {
    type: [Number],
    required: true,
  }
},{
  timestamps: true
});

export const RentalOfferDbo = mongoose.model<IRentalOffer>('RentalOffer', RentalOfferSchema);
