import { injectable, inject } from 'inversify';
import {Model, Types} from 'mongoose';
import {TYPES} from '../types.js';
import {Comment} from '../../domain/rent/Comment.js';
import {IComment} from './comment.schema.js';
import {UserRepository} from './user.repository.js';


@injectable()
export class CommentRepository {
  constructor(
    @inject(TYPES.CommentModel) private readonly commentModel: Model<IComment>,
    @inject(TYPES.UserService) private readonly userService: UserRepository
  ) {}

  private async mapToComment(doc: IComment): Promise<Comment> {
    const author = await this.userService.findById(doc.userId.toString());
    if (!author) {
      throw new Error('Author not found');
    }
    return new Comment(doc.text, doc.createdAt, doc.rating, author);
  }

  async create(comment: Comment, offerId: string): Promise<Comment> {
    const newComment = new this.commentModel({
      text: comment.text,
      publishDate: comment.publishDate,
      rating: comment.rating,
      authorId: comment.author._id,
      offerId: new Types.ObjectId(offerId)
    });
    const savedComment = await newComment.save();
    return this.mapToComment(savedComment);
  }

  async findById(id: string): Promise<Comment | null> {
    const comment = await this.commentModel.findById(id).exec();
    return comment ? this.mapToComment(comment) : null;
  }

  async findByOfferId(offerId: string): Promise<Comment[]> {
    const comments = await this.commentModel.find({ offerId: new Types.ObjectId(offerId) }).exec();
    return Promise.all(comments.map((comment) => this.mapToComment(comment)));
  }

  async update(id: string, commentData: Partial<Comment>): Promise<Comment | null> {
    const updatedComment = await this.commentModel.findByIdAndUpdate(
      id,
      {
        text: commentData.text,
        rating: commentData.rating,
        publishDate: commentData.publishDate
      },
      { new: true }
    ).exec();
    return updatedComment ? this.mapToComment(updatedComment) : null;
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
