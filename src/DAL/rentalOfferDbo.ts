import mongoose, { Document, Schema } from 'mongoose';
import {Facilities} from '../domain/rent/Facilities.js';
import {HousingType} from '../domain/rent/HousingType.js';
import {City} from '../domain/rent/City.js';

interface IRentalOfferMethods {
  calculateRating(): Promise<number>;
}

export interface IRentalOffer extends Document, IRentalOfferMethods {
  title: string;
  description: string;
  publishDate: Date;
  city: City;
  previewImage: string;
  photos: string[];
  isPremium: boolean;
  isFavorite: boolean;
  housingType: HousingType;
  rooms: number;
  guests: number;
  price: number;
  facilities: Facilities[];
  author: mongoose.Types.ObjectId;
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
    enum: Object.values(City)
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
    ref: 'UserDbo',
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

RentalOfferSchema.virtual('rating').get(function(this: IRentalOffer) {
  return this.calculateRating();
});


RentalOfferSchema.methods.calculateRating = async function(this: IRentalOffer) {
  const CommentModel = mongoose.model('Comment');
  const comments = await CommentModel.find({ rentalOffer: this._id });

  if (comments.length === 0) {
    return 0;
  }

  const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
  return Number((totalRating / comments.length).toFixed(1));
};

export const RentalOfferDbo = mongoose.model<IRentalOffer>('RentalOffer', RentalOfferSchema);
