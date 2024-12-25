import { ObjectId } from 'mongodb';
import {IsInt, IsString, Length, Max, Min} from 'class-validator';
import {Schema} from 'mongoose';

export class CommentDbo {
  // @ts-ignore
  _id: Schema.Types.ObjectId;

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
