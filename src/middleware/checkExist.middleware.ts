import { Request, Response, NextFunction } from 'express';
import {Middleware} from './middleware.interface.js';
import {IBaseService} from '../infrastructure/DAL/IBaseService.js';

export class CheckExistMiddleware implements Middleware {
  constructor(private service: IBaseService, private idParam: string) {}

  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = req.params[this.idParam];
    if (!id) {
      res.status(400).json({ message: 'ID is required' });
      return;
    }

    const exists = await this.service.exists(id);
    if (!exists) {
      res.status(404).json({ message: 'Not found' });
      return;
    }

    next();
  }
}
