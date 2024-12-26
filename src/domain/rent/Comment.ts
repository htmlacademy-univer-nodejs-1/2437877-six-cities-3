import mongoose from 'mongoose';

export class Comment {
  text: string;
  publishDate: Date;
  rating: number;
  authorId: mongoose.Types.ObjectId;
  offerId: mongoose.Types.ObjectId;

  constructor(text: string, publishDate: Date, rating: number, authorId: mongoose.Types.ObjectId, offerId: mongoose.Types.ObjectId) {
    this.text = text;
    this.publishDate = publishDate;
    this.rating = rating;
    this.authorId = authorId;
    this.offerId = offerId;
  }
}
