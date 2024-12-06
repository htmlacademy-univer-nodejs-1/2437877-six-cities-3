import {NextFunction, Request, Response} from 'express';
import {Middleware} from './middleware.interface.js';
import {ParamsDictionary} from 'express-serve-static-core';
import {ParsedQs} from 'qs';

export class AuthMiddleware implements Middleware {
  execute(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction): void {
    const token = req?.headers?.get('Authorization');
    if (!token) {
      res.status(401).send('Unauthorized');
      return;
    }

    next();
  }
}
