import {IUser} from '../../infrastructure/DAL/user.model.js';

export class Comment {
  text: string;
  publishDate: Date;
  rating: number;
  author: IUser;

  constructor(text: string, publishDate: Date, rating: number, author: IUser) {
    this.text = text;
    this.publishDate = publishDate;
    this.rating = rating;
    this.author = author;
  }
}
