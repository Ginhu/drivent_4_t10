import { ApplicationError } from '@/protocols';

export function cannotFindBookingError(): ApplicationError {
  return {
    name: 'CannotFindBookingError',
    message: 'Cannot find booking!',
  };
}
