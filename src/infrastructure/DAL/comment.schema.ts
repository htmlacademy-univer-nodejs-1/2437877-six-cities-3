import mongoose, { Schema } from 'mongoose';

export interface IComment {
  _id: Schema.Types.ObjectId,
  text: string;
  createdAt: Date;
  rating: number;
  userId: mongoose.Types.ObjectId;
  offerId: mongoose.Types.ObjectId;
}

const commentSchema = new Schema<IComment>({
  _id: Schema.Types.ObjectId,
  text: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offerId: {
    type: Schema.Types.ObjectId,
    ref: 'RentalOffer',
    required: true
  }
});

export const CommentModel =  mongoose.model<IComment>('Comment', commentSchema);
