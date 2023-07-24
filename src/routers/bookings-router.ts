import { Router } from 'express';
import { createBooking, getBookings, updateBooking } from '../controllers/booking-controller';
import { authenticateToken } from '../middlewares';

const bookingsRouter = Router();

bookingsRouter
  .get('/', authenticateToken, getBookings)
  .post('/', authenticateToken, createBooking)
  .put('/:bookingId', authenticateToken, updateBooking);

export { bookingsRouter };
