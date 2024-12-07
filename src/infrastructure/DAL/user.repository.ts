import { injectable, inject } from 'inversify';
import { Model } from 'mongoose';
import { TYPES } from '../types.js';
import { ILogger } from '../Logger/ILogger.js';
import {IUser} from "./user.model.js";

@injectable()
export class UserRepository {
  constructor(
    @inject(TYPES.UserModel) private userModel: Model<IUser>,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async findById(id: string): Promise<IUser | null> {
    try {
      return await this.userModel.findById(id).lean();
    } catch (error) {
      this.logger.error(`Error finding user by ID: ${id}`, error as Error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await this.userModel.findOne({ email }).lean();
    } catch (error) {
      this.logger.error(`Error finding user by email: ${email}`, error as Error);
      return null;
    }
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = new this.userModel(userData);
      return await user.save();
    } catch (error) {
      this.logger.error('Error creating user', error as Error);
      throw error;
    }
  }

  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    try {
      return await this.userModel
        .findByIdAndUpdate(id, userData, { new: true })
        .lean();
    } catch (error) {
      this.logger.error(`Error updating user with ID: ${id}`, error as Error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.userModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      this.logger.error(`Error deleting user with ID: ${id}`, error as Error);
      return false;
    }
  }

  async findAll(
    filter: Partial<IUser> = {},
    skip = 0,
    limit = 10
  ): Promise<IUser[]> {
    try {
      return await this.userModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      this.logger.error('Error finding users', error as Error);
      return [];
    }
  }

  async count(filter: Partial<IUser> = {}): Promise<number> {
    try {
      return await this.userModel.countDocuments(filter);
    } catch (error) {
      this.logger.error('Error counting users', error as Error);
      return 0;
    }
  }
}
