import { notFoundError } from '../../errors';
import { cannotFindBookingError } from '../../errors/cannot-find-booking';
import { cannotFindRoomError } from '../../errors/cannot-find-room';
import { roomUnavailableError } from '../../errors/room-unnavailable';
import bookingsRepository from '../../repositories/booking-repository';
import hotelsService from '../hotels-service';

async function getBookings(userId: number) {
  const bookings = await bookingsRepository.getBookings(userId);
  if (!bookings) throw notFoundError();

  return bookings;
}

async function createBooking(userId: number, roomId: number) {
  await hotelsService.listHotels(userId);
  await checkRoomAndAvailability(roomId);

  const booking = await bookingsRepository.createBooking(userId, roomId);

  return booking;
}

async function updateBooking(bookingId: number, roomId: number) {
  await findBookingById(bookingId);
  await checkRoomAndAvailability(roomId);

  const booking = await bookingsRepository.updateBooking(bookingId, roomId);
  return booking;
}

async function checkRoomAndAvailability(roomId: number) {
  const room = await bookingsRepository.findRoomById(roomId);
  if (!room) throw cannotFindRoomError();

  const available = await bookingsRepository.isRoomAvailable(roomId);
  if (available >= room.capacity) throw roomUnavailableError();
}

async function findBookingById(bookingId: number) {
  const booking = await bookingsRepository.findBookingById(bookingId);
  if (!booking) throw cannotFindBookingError();
}

const bookingsService = { getBookings, createBooking, updateBooking, checkRoomAndAvailability, findBookingById };

export default bookingsService;
