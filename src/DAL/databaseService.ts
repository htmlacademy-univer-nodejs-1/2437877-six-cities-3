import {IUser} from './userDbo.js';
import {IRentalOffer} from './rentalOfferDbo.js';
import {RentalOffer} from '../domain/rent/RentalOffer.js';
import {User} from '../domain/user/User.js';

export interface IUserService {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Partial<IUser>): Promise<User>;
}

export interface IRentalOfferService {
  findById(id: string): Promise<RentalOffer | null>;
  create(document: Partial<IRentalOffer>): Promise<IRentalOffer>;
}
