import mongoose, { Schema } from 'mongoose';
import {UserType} from '../../domain/user/UserType.js';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  avatar: string;
  passwordHash: string;
  userType: UserType;
  favoriteOffers: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 15
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  passwordHash: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    required: true,
    enum: ['regular', 'pro']
  },
  favoriteOffers: [Schema.ObjectId]
},{
  timestamps: true
});

export const UserModel = mongoose.model<IUser>('User', userSchema);
