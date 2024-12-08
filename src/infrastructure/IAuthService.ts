import {IUser} from './DAL/user.model.js';
import {UserType} from '../domain/user/UserType.js';

export interface IAuthService {
  login(usernameOrEmail: string, password: string): Promise<string>;
  register(name: string, email: string, password: string, avatar: string, userType: UserType): Promise<IUser >
  logout(token: string): Promise<void>;
  validateToken(token: string): Promise<IUser>;
}
