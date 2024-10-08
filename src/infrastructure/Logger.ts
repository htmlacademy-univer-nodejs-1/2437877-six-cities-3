import pino from 'pino';

interface Logger {
  fatal: pino.LogFn;
  error: pino.LogFn;
  warn: pino.LogFn;
  info: pino.LogFn;
  debug: pino.LogFn;
  trace: pino.LogFn;
}

export const logger : Logger = pino.pino(
  {
    level: process.env.PINO_LOG_LEVEL || 'info',
  }
);


process.on('uncaughtException', (err) => {
  logger.fatal(err, 'обнаружено неотловленное исключение');
  // eslint-disable-next-line node/no-process-exit,no-process-exit
  process.exit(1);
});
