import { Response } from 'express';
import { injectable } from 'inversify';

@injectable()
export abstract class BaseController {
  protected sendOk<T>(res: Response, data: T): Response {
    return res.status(200).json({
      success: true,
      data
    });
  }

  protected sendCreated<T>(res: Response, data: T): Response {
    return res.status(201).json({
      success: true,
      data
    });
  }

  protected sendBadRequest(
    res: Response,
    errorMessage: string
  ): Response {
    return res.status(400).json({
      success: false,
      errorMessage
    });
  }

  protected sendForbidden(
    res: Response,
    message: string = 'Forbidden'
  ): Response {
    return res.status(403).json({
      success: false,
      message
    });
  }

  protected sendUnauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): Response {
    return res.status(401).json({
      success: false,
      message
    });
  }

  protected sendNotFound(
    res: Response,
    message: string = 'Not Found'
  ): Response {
    return res.status(404).json({
      success: false,
      message
    });
  }
}
