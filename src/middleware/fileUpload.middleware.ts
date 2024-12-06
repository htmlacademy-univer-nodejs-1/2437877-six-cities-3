import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import mime from 'mime-types';
import { injectable, inject } from 'inversify';
import {TYPES} from '../infrastructure/types.js';
import {IConfig} from '../infrastructure/Config/IConfig.js';
import {Middleware} from './middleware.interface.js';

@injectable()
export class FileUploadMiddleware implements Middleware {
  private upload: multer.Multer;

  constructor(
    @inject(TYPES.Config) private readonly config: IConfig,
    private readonly fieldName: string
  ) {
    const storage = multer.diskStorage({
      destination: (_, __, cb) => {
        cb(null, this.config.UPLOAD_DIR);
      },
      filename: (_, file, cb) => {
        const uniqueName = nanoid();
        const extension = mime.extension(file.mimetype);
        cb(null, `${uniqueName}.${extension}`);
      },
    });

    this.upload = multer({storage});
  }

  execute(req: Request, res: Response, next: NextFunction): void {
    this.upload.single(this.fieldName)(req, res, (err) => {
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }
      next();
    });
  }
}
