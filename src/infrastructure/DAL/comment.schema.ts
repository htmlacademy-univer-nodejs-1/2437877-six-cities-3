import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  text: string;
  createdAt: Date;
  rating: number;
  userId: mongoose.Types.ObjectId;
  offerId: mongoose.Types.ObjectId;
}

const CommentSchema: Schema = new Schema({
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

export default mongoose.model<IComment>('Comment', CommentSchema);
