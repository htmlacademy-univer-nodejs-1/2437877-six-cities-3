import { ObjectId } from 'mongodb';
import {IsInt, IsString, Length, Max, Min} from 'class-validator';

export class CommentDbo {
  _id?: ObjectId;

  @IsString()
  @Length(5, 1024)
    text: string | undefined;

  createdAt: Date;

  @IsInt()
  @Min(1)
  @Max(5)
    rating: number | undefined;

  userId: ObjectId | undefined;
  offerId: ObjectId | undefined;

  constructor(data: Partial<CommentDbo>) {
    Object.assign(this, data);
    this.createdAt = new Date();
  }
}
