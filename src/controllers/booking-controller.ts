import httpStatus from 'http-status';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares';
import bookingsService from '../services/booking-service';

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const bookings = await bookingsService.getBookings(userId);
    return res.status(httpStatus.OK).send(bookings);
  } catch (error) {
    if (error.name === 'NotFoundError') return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  try {
    const booking = await bookingsService.createBooking(userId, roomId);
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === 'NotFoundError') return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === 'CannotFindRoomError') return res.sendStatus(httpStatus.NOT_FOUND);
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const bookingId = Number(req.params.bookingId);
  const { roomId } = req.body;

  try {
    const updateBooking = await bookingsService.updateBooking(bookingId, roomId);
    res.status(httpStatus.OK).send({ roomId: updateBooking.roomId, bookingId: updateBooking.id });
  } catch (error) {
    if (error.name === 'CannotFindRoomError') return res.sendStatus(httpStatus.NOT_FOUND);
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
