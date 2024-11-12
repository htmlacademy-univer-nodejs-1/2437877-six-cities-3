import { UserDbo, IUser } from './userDbo.js';
import { IUserService } from './databaseService.js';
import { injectable } from 'inversify';
import {User} from '../domain/user/User.js';
import {UserMapper} from '../UserMapper.js';


@injectable()
export class UserService implements IUserService {
  async findById(id: string): Promise<User | null> {
    const userDbo = await UserDbo.findById(id).exec();
    return userDbo ? UserMapper.toDomain(userDbo) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDbo = await UserDbo.findOne({ email }).exec();
    return userDbo ? UserMapper.toDomain(userDbo) : null;
  }

  async create(userData: Partial<IUser>): Promise<User> {
    const newUser = new UserDbo(userData);
    const savedUser = await newUser.save();
    return UserMapper.toDomain(savedUser);
  }
}
