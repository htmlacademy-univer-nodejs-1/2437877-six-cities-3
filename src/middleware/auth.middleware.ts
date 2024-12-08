import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/types.js';
import {NextFunction, Request, Response} from 'express';
import {IAuthService} from '../infrastructure/IAuthService.js';

@injectable()
export class AuthMiddleware {
  constructor(
    @inject(TYPES.AuthService) private authService: IAuthService
  ) {}

  private getTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return null;
  }

  async execute(req: Request, res: Response, next: NextFunction) {
    const token = this.getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        message: 'Отсутствует токен авторизации'
      });
    }

    try {
      const user = await this.authService.validateToken(token);

      if (!user) {
        return res.status(401).json({
          message: 'Пользователь не найден'
        });
      }

      return next();

    } catch (error) {
      return res.status(500).json({
        message: 'Ошибка сервера'
      });
    }
  }
}
