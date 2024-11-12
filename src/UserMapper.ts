import {IUser} from './DAL/userDbo.js';
import {User} from './domain/user/User.js';
import {UserType} from './domain/user/UserType.js';
import mongoose from 'mongoose';

export class UserMapper {
  public static toDomain(userDbo: IUser): User {
    return new User(
      userDbo._id.toString(),
      userDbo.name,
      userDbo.email,
      userDbo.password,
      userDbo.userType as UserType,
      userDbo.avatar
    );
  }

  public static toDb(user: User): Partial<IUser> {
    return {
      ...(user.id && { _id: new mongoose.Types.ObjectId(user.id) }),
      name: user.name,
      email: user.email,
      password: user.password,
      userType: user.userType,
      avatar: user.avatar
    };
  }
}
