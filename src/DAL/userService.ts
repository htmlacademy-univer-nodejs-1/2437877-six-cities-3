import { UserDbo, IUser } from './userDbo.js';
import {IUserService} from './databaseService.js';
import {injectable} from 'inversify';

@injectable()
export class UserService implements IUserService {
  async findById(id: string): Promise<IUser | null> {
    return UserDbo.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserDbo.findOne({ email }).exec();
  }

  async create(user: Partial<IUser>): Promise<IUser> {
    const newUser = new UserDbo(user);
    return newUser.save();
  }
}
