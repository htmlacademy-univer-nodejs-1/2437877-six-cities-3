import { SignJWT, jwtVerify } from 'jose';
import { injectable, inject } from 'inversify';
import { IAuthService } from './IAuthService.js';
import { IUser } from './DAL/user.model.js';
import { TYPES } from './types.js';
import { ILogger } from './Logger/ILogger.js';
import { IConfig } from './Config/IConfig.js';
import { createSecretKey, KeyObject } from 'node:crypto';
import bcrypt from 'bcrypt';
import {UserRepository} from './DAL/user.repository.js';
import {ObjectId} from 'mongodb';

export type JWTPayload = {
  readonly userId: string;
  readonly email: string;
};

@injectable()
export class JWTAuthService implements IAuthService {
  private readonly secretKey: KeyObject;
  private readonly saltRounds = 10;
  private readonly tokenWhitelist: Set<string> = new Set();

  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.Config) private readonly config: IConfig,
    @inject(TYPES.UserService) private readonly userRepository: UserRepository
  ) {
    this.secretKey = createSecretKey(this.config.JWT_SECRET, 'utf-8');
  }

  async register(name: string, email: string, password: string, avatar: string, userType: 'regular' | 'pro'): Promise<IUser > {
    try {
      // Проверяем, существует ли уже пользователь с таким email
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error('User  with this email already exists');
      }

      // Хешируем пароль
      const hashedPassword = await this.hashPassword(password);

      // Создаем нового пользователя
      const newUser: IUser = {
        _id: new ObjectId(),
        name,
        email,
        avatar,
        password: hashedPassword,
        userType,
      };

      await this.userRepository.create(newUser);

      return newUser ;
    } catch (error) {
      this.logger.error('Registration error', error as Error);
      throw new Error('Failed to register user');
    }
  }

  async login(username: string, password: string): Promise<string> {
    try {
      const user = await this.userRepository.findById(username);

      if (!user) {
        throw new Error('User  not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      const token = await this.generateToken(user);
      this.tokenWhitelist.add(token);
      return token;
    } catch (error) {
      this.logger.error('Login error', error as Error);
      throw new Error('Invalid credentials');
    }
  }

  async logout(token: string): Promise<void> {
    this.tokenWhitelist.delete(token);
    return Promise.resolve();
  }

  async validateToken(token: string): Promise<IUser > {
    if (!this.tokenWhitelist.has(token)) {
      throw new Error('Token is not valid or has been revoked');
    }

    try {
      const { payload } = await jwtVerify(token, this.secretKey);

      const user = await this.userRepository.findById(payload.sub!);
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error('Token validation error', error as Error);
      throw new Error('Invalid token');
    }
  }

  private async generateToken(user: IUser): Promise<string> {
    try {
      if(!user._id){
        throw new Error('Id can\'t be empty');
      }

      const payload: JWTPayload = {email: user.email, userId: user._id.toString() };
      const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(user._id.toString())
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(this.secretKey);

      return token;
    } catch (error) {
      this.logger.error('Token generation error', error as Error);
      throw new Error('Failed to generate token');
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
}
