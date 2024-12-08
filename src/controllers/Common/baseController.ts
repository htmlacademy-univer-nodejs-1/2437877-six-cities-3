import {Response, Router} from 'express';
import {injectable} from 'inversify';
import {ILogger} from '../../infrastructure/Logger/ILogger.js';
import {Route} from './route.interface.js';
import asyncHandler from 'express-async-handler';

@injectable()
export abstract class BaseController {
  private readonly _router: Router;

  constructor(
    protected readonly logger: ILogger
  ) {
    this._router = Router();
  }

  get router() {
    return this._router;
  }

  public addRoute(route: Route) {
    const wrapperAsyncHandler = asyncHandler(route.handler.bind(this));
    const middlewareHandlers = route.middlewares?.map(
      (item) => asyncHandler(item.execute.bind(item))
    );
    const allHandlers = middlewareHandlers ? [...middlewareHandlers, wrapperAsyncHandler] : wrapperAsyncHandler;

    this._router[route.method](route.path, allHandlers);
    this.logger.info(`Route registered: ${route.method.toUpperCase()} ${route.path}`);
  }

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

  protected sendNoContent(res: Response): Response {
    return res.status(204).send();
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

  protected sendConflict(res: Response, message: string = 'Conflict'): Response {
    return res.status(409).json({
      success: false,
      error: message
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
