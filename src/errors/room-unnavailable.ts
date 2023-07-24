import { ApplicationError } from '@/protocols';

export function roomUnavailableError(): ApplicationError {
  return {
    name: 'RoomUnavailable',
    message: 'Room Unavailable!',
  };
}
