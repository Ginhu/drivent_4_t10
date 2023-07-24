import { ApplicationError } from '@/protocols';

export function cannotFindRoomError(): ApplicationError {
  return {
    name: 'CannotFindRoomError',
    message: 'Cannot find room!',
  };
}
