import { pino } from 'pino';
import { injectable } from 'inversify';
import { ILogger } from './ILogger.js';

@injectable()
export class PinoLogger implements ILogger {
  private readonly logger;

  constructor() {
    this.logger = pino();

    process.on('uncaughtException', (err) => {
      this.logger.fatal(err, 'обнаружено неотловленное исключение');
      // eslint-disable-next-line node/no-process-exit,no-process-exit
      process.exit(1);
    });


    this.logger.info('Logger created.');
  }

  public debug(message: string, ...args: unknown[]): void {
    this.logger.debug(message, ...args);
  }

  public error(message: string, error: Error, ...args: unknown[]): void {
    this.logger.error(error, message, ...args);
  }

  public info(message: string, ...args: unknown[]): void {
    this.logger.info(message, ...args);
  }

  public warn(message: string, ...args: unknown[]): void {
    this.logger.warn(message, ...args);
  }
}
