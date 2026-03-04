export const loggerTypes = [
    'app',
    'auth',
    'cart',
    'items',
    'orders',
    'payments',
    'users',
    'utils',
    'errors',
    'middlewares',
    'routes',
    'services',
    'types',
] as const;

export type LoggerType = (typeof loggerTypes)[number];

const loggerTypeSet = new Set<string>(loggerTypes);

export function isLoggerType(value: string): value is LoggerType {
  return loggerTypeSet.has(value);
}
