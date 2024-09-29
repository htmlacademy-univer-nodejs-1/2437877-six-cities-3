import { User } from '../user/User.js';

export class Comment {
  text: string;
  publishDate: Date;
  rating: number;
  author: User;

  constructor(text: string, publishDate: Date, rating: number, author: User) {
    this.text = text;
    this.publishDate = publishDate;
    this.rating = rating;
    this.author = author;
  }
}
