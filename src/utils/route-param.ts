import { AppError } from './app-error.js';

export const getRouteParam = (
  value: string | string[] | undefined,
  name: string
): string => {
  if (typeof value !== 'string' || !value) {
    throw new AppError(
      400,
      `Invalid ${name}.`,
      'INVALID_ROUTE_PARAM'
    );
  }

  return value;
};