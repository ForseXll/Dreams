import type { FastifyBaseLogger } from 'fastify';
import { isLoggerType, type LoggerType } from './logger-types';

type LoggerLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

type LoggerLike = {
  trace: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  fatal: (...args: unknown[]) => void;
  child: (bindings: Record<string, unknown>) => LoggerLike;
};

const loggerLevels: readonly LoggerLevel[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];

function createNoopLogger(): LoggerLike {
  const noop = () => undefined;
  const logger: LoggerLike = {
    trace: noop,
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    fatal: noop,
    child: () => logger,
  };

  return logger;
}

function parseEnabledTypes(rawTypes: string | undefined) {
  if (!rawTypes) {
    return { valid: [] as LoggerType[], invalid: [] as string[] };
  }

  const parsed = rawTypes
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const valid = parsed.filter((value): value is LoggerType => isLoggerType(value));
  const invalid = parsed.filter((value) => !isLoggerType(value));

  return { valid: Array.from(new Set(valid)), invalid: Array.from(new Set(invalid)) };
}

function parseLoggerLevel(rawLevel: string | undefined): LoggerLevel {
  const level = rawLevel?.trim().toLowerCase();

  if (level && loggerLevels.includes(level as LoggerLevel)) {
    return level as LoggerLevel;
  }

  return 'info';
}

function parsePrettyFlag(rawValue: string | undefined): boolean {
  return rawValue?.trim().toLowerCase() === 'true';
}

class LoggerProvider {
  private baseLogger: LoggerLike = createNoopLogger();
  private enabledTypes = new Set<LoggerType>();
  private readonly noopLogger = createNoopLogger();

  configure(baseLogger: FastifyBaseLogger) {
    this.baseLogger = baseLogger as unknown as LoggerLike;

    const { valid, invalid } = parseEnabledTypes(process.env.LOGGER_TYPES);
    this.enabledTypes = new Set(valid);

    if (invalid.length > 0) {
      this.baseLogger.warn(
        {
          invalidLoggerTypes: invalid,
          configuredLoggerTypes: process.env.LOGGER_TYPES,
        },
        'Ignored invalid logger types from LOGGER_TYPES'
      );
    }
  }

  child(type: LoggerType): LoggerLike {
    if (!this.enabledTypes.has(type)) {
      return this.noopLogger;
    }

    return this.baseLogger.child({ type });
  }
}

export function createFastifyLoggerOptions() {
  const level = parseLoggerLevel(process.env.LOGGER_LEVEL);
  const pretty = parsePrettyFlag(process.env.LOGGER_PRETTY);

  if (!pretty) {
    return { level };
  }

  return {
    level,
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        colorize: true,
        ignore: 'pid,hostname',
      },
    },
  };
}

const provider = new LoggerProvider();

export const logger = {
  provider,
};
