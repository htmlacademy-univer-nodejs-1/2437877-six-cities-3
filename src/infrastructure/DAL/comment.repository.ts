import { injectable, inject } from 'inversify';
import {Model, Types} from 'mongoose';
import {TYPES} from '../types.js';
import {Comment} from '../../domain/rent/Comment.js';
import {IComment} from './comment.schema.js';


@injectable()
export class CommentRepository {
  constructor(
    @inject(TYPES.CommentModel) private readonly commentModel: Model<IComment>,
  ) {}

  async create(comment: Comment, offerId: Types.ObjectId): Promise<IComment> {
    const newComment = new this.commentModel({
      _id: new Types.ObjectId(),
      text: comment.text,
      publishDate: comment.publishDate,
      rating: comment.rating,
      authorId: comment.authorId,
      offerId: offerId
    });
    const savedComment = await newComment.save();
    return savedComment as IComment;
  }

  async findById(id: string): Promise<IComment | null> {
    const comment = await this.commentModel.findById(id).exec();
    return comment as IComment;
  }

  async findByOfferId(offerId: string): Promise<IComment[]> {
    const comments = await this.commentModel.find({ offerId: new Types.ObjectId(offerId) }).exec();
    return Promise.all(comments.map((comment) => comment as IComment));
  }

  async update(id: string, commentData: Partial<Comment>): Promise<IComment | null> {
    const updatedComment = await this.commentModel.findByIdAndUpdate(
      id,
      {
        text: commentData.text,
        rating: commentData.rating,
        publishDate: commentData.publishDate
      },
      { new: true }
    ).exec();
    return updatedComment as IComment;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.commentModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async countByOfferId(offerId: string): Promise<number> {
    return await this.commentModel.countDocuments({ offerId: new Types.ObjectId(offerId) }).exec();
  }

  async getAverageRatingByOfferId(offerId: string): Promise<number> {
    const result = await this.commentModel.aggregate([
      { $match: { offerId: new Types.ObjectId(offerId) } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]).exec();

    return result.length > 0 ? result[0].averageRating : 0;
  }
}
