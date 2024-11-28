import {IUser} from './userDbo.js';
import {User} from '../domain/user/User.js';

export interface IUserService {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Partial<IUser>): Promise<User>;
}
