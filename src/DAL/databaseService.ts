import { Document } from 'mongoose';
import {IUser} from './userDbo.js';
import {IRentalOffer} from './rentalOfferDbo.js';

export interface IDatabaseService<T extends Document> {
  findById(id: string): Promise<T | null>;
  create(document: Partial<T>): Promise<T>;
}

export interface IUserService extends IDatabaseService<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

export interface IRentalOfferService extends IDatabaseService<IRentalOffer> {
}
