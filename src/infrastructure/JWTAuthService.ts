import { SignJWT, jwtVerify } from 'jose';
import { injectable, inject } from 'inversify';
import { IAuthService } from './IAuthService.js';
import { IUser, UserDbo } from './DAL/userDbo.js';
import { TYPES } from './types.js';
import { ILogger } from './Logger/ILogger.js';
import { IConfig } from './Config/IConfig.js';
import { createSecretKey, KeyObject } from 'node:crypto';
import bcrypt from 'bcrypt';

@injectable()
export class JWTAuthService implements IAuthService {
  private readonly secretKey: KeyObject;
  private readonly saltRounds = 10;
  private readonly tokenWhitelist: Set<string> = new Set();

  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.Config) private readonly config: IConfig
  ) {
    this.secretKey = createSecretKey(this.config.JWT_SECRET, 'utf-8');
  }

  async register(name: string, email: string, password: string, avatar: string, userType: 'regular' | 'pro'): Promise<IUser > {
    try {
      // Проверяем, существует ли уже пользователь с таким email
      const existingUser = await UserDbo.findOne({ email });
      if (existingUser) {
        throw new Error('User  with this email already exists');
      }

      // Хешируем пароль
      const hashedPassword = await this.hashPassword(password);

      // Создаем нового пользователя
      const newUser = new UserDbo({
        name,
        email,
        avatar,
        password: hashedPassword,
        userType,
      });

      // Сохраняем пользователя в базе данных
      await newUser .save();

      return newUser ;
    } catch (error) {
      this.logger.error('Registration error', error as Error);
      throw new Error('Failed to register user');
    }
  }

  async login(usernameOrEmail: string, password: string): Promise<string> {
    try {
      const user = await UserDbo.findOne({ email: usernameOrEmail });

      if (!user) {
        throw new Error('User  not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      const token = await this.generateToken(user);
      this.tokenWhitelist.add(token); // Добавляем токен в белый список
      return token;
    } catch (error) {
      this.logger.error('Login error', error as Error);
      throw new Error('Invalid credentials');
    }
  }

  async logout(token: string): Promise<void> {
    // Удаляем токен из белого списка
    this.tokenWhitelist.delete(token);
    return Promise.resolve();
  }

  async validateToken(token: string): Promise<IUser > {
    // Проверяем, находится ли токен в белом списке
    if (!this.tokenWhitelist.has(token)) {
      throw new Error('Token is not valid or has been revoked');
    }

    try {
      const { payload } = await jwtVerify(token, this.secretKey);

      const user = await UserDbo.findById(payload.sub);
      if (!user) {
        throw new Error('User  not found');
      }

      return user;
    } catch (error) {
      this.logger.error('Token validation error', error as Error);
      throw new Error('Invalid token');
    }
  }

  private async generateToken(user: IUser): Promise<string> {
    try {
      const token = await new SignJWT({ email: user.email })
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
