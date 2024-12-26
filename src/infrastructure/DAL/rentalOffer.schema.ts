import mongoose, {Schema} from 'mongoose';
import {Facilities, Facility} from '../../domain/rent/Facilities.js';
import {HousingType, HousingTypes} from '../../domain/rent/HousingType.js';
import {Cities, City} from '../../domain/rent/City.js';

interface IRentalOfferMethods {
  calculateRating(): Promise<number>;
}

export interface IRentalOffer extends IRentalOfferMethods {
  _id: mongoose.Types.ObjectId,
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
  facilities: Facility[];
  author: mongoose.Types.ObjectId;
  commentsCount: number;
  coordinates: [number, number];
}

const rentalOfferSchema = new Schema<IRentalOffer>({
  _id: mongoose.Types.ObjectId,
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
    enum: Cities
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
  housingType: {
    type: String,
    required: true,
    enum: HousingTypes
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
    enum: Facilities
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'UserDbo',
    required: true
  },
  coordinates: {
    type: [Number],
    required: true,
  }
},{
  timestamps: true
});

rentalOfferSchema.virtual('rating').get(function(this: IRentalOffer) {
  return this.calculateRating();
});


rentalOfferSchema.methods.calculateRating = async function(this: IRentalOffer) {
  const CommentModel = mongoose.model('Comment');
  const comments = await CommentModel.find({ offerId: this._id });

  if (comments.length === 0) {
    return 0;
  }

  const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
  return Number((totalRating / comments.length).toFixed(1));
};

export const RentalOfferSchema = mongoose.model<IRentalOffer>('RentalOffer', rentalOfferSchema);
