import { EnvVars } from './env-vars';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

type ChildLoggers = {
  [from: string]: Logger;
};

const childLoggers: ChildLoggers = {};

/** Cache for {@link winston.Logger}. */
let winstonInstance: winston.Logger | undefined;

/**
 * Instantiates a logger and caches it for subsequent calls to this function.
 *
 * @param from - If the logger is for a function, pass `__filename`. If it's for middleware, pass something like
 * `'Express.js'`.
 */
export function getLogger(from: string): Logger {
  if (winstonInstance === undefined) setWinstonInstance();
  const cachedLogger = childLoggers[from];
  if (cachedLogger !== undefined) return cachedLogger;
  const logger = winstonInstance!.child({ from });
  const child = new DefaultLogger(logger);
  childLoggers[from] = child;
  return child;
}

function setWinstonInstance(): void {
  winstonInstance = winston.createLogger({
    level: EnvVars.getNodeEnv() === 'prod' ? 'info' : 'debug',
    levels: winston.config.syslog.levels,
    silent: EnvVars.getNodeEnv() === 'test',
    transports: [
      new winston.transports.Console(),
      new DailyRotateFile({ dirname: 'logs', filename: 'default.%DATE%.log', maxSize: '20m', maxFiles: '1d' }),
    ],
    exceptionHandlers: [
      new winston.transports.Console(),
      new DailyRotateFile({ dirname: 'logs', filename: 'exceptions.%DATE%.log', maxSize: '20m', maxFiles: '1d' }),
    ],
    rejectionHandlers: [
      new winston.transports.Console(),
      new DailyRotateFile({ dirname: 'logs', filename: 'rejections.%DATE%.log', maxSize: '20m', maxFiles: '1d' }),
    ],
  });
}

/*
It's better to use an abstraction for complex dependencies such as logging libraries. Node.js has several popular
logging libraries, and we may need to migrate to yet another one. Since all logging libraries are similar, an
abstraction such as this helps greatly.
 */
/** Conforms to [The Syslog Protocol](https://datatracker.ietf.org/doc/html/rfc5424). */
export interface Logger {
  /**
   * System is unusable.
   *
   * Example use cases:
   * - There has been guaranteed data loss - the DB has been corrupted, and will need to be restored from a backup.
   * - Users' passwords have been leaked.
   */
  emergency(message: any): void;

  /**
   * Action must be taken immediately.
   *
   * Example use cases:
   * - The entire system is down.
   * - Not a single blockchain's data is getting processed.
   */
  alert(message: any): void;

  /**
   * Critical conditions.
   *
   * Example use cases:
   * - A subsystem is down.
   * - One blockchain's data isn't getting processed.
   */
  critical(message: any): void;

  /**
   * Error conditions.
   *
   * Example use cases:
   * - Expected errors where no action is required but action may be required if there are an unusual number of errors
   * occurring suddenly.
   * - A third party service rate limited our API request.
   */
  error(message: any): void;

  /**
   * Warning conditions.
   *
   * Example use cases:
   * - Something may eventually go wrong but nothing bad has happened so far, and nothing bad will happen for a while.
   * - The CPU is at 80% utilization instead of the usual 60%, and the software is running just as smoothly as it was,
   * but it may continue to grow until 100% utilization at which point the software will crash.
   */
  warning(message: any): void;

  /**
   * Normal but significant condition.
   *
   * Example use cases:
   * - An incoming HTTP API request.
   */
  notice(message: any): void;

  /**
   * Informational messages.
   *
   * Example use cases:
   * - Intermediate results of an HTTP API request's execution which are understandable by a sysadmin who didn't write
   * the software.
   */
  informational(message: any): void;

  /**
   * Debug-level messages.
   *
   * Example use cases:
   * - Logging that data is being sent to be cached.
   * - Logging that data is being fetched via a network call because it didn't exist in the cache.
   */
  debug(message: any): void;
}

class DefaultLogger implements Logger {
  constructor(private readonly logger: winston.Logger) {}

  emergency(message: any): void {
    this.logger.emerg(message);
  }

  alert(message: any): void {
    this.logger.alert(message);
  }

  critical(message: any): void {
    this.logger.crit(message);
  }

  error(message: any): void {
    this.logger.error(message);
  }

  warning(message: any): void {
    this.logger.warning(message);
  }

  notice(message: any): void {
    this.logger.notice(message);
  }

  informational(message: any): void {
    this.logger.info(message);
  }

  debug(message: any): void {
    this.logger.debug(message);
  }
}
