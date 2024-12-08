import mongoose, { Schema } from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  avatar: string;
  password: string;
  userType: 'regular' | 'pro';
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
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 12
  },
  userType: {
    type: String,
    required: true,
    enum: ['regular', 'pro']
  }
},{
  timestamps: true
});

export const UserModel = mongoose.model<IUser>('User', userSchema);
