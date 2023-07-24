import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '.prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createHotel,
  createPayment,
  createRoomWithHotelId,
  createTicket,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createTicketTypeWithNoHotel,
  createUser,
} from '../factories';
import { createBooking } from '../factories/bookings-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /bookings', () => {
  describe('When token is not valid', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.get('/booking');

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when there is no bookings ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 when there is a booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      await createBooking(user.id, hotelRoom.id);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
    });
  });
});

describe('POST /bookings', () => {
  describe('When token is not valid', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.post('/booking');

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('When token is valid', () => {
    it('should respond with status 402 when user ticket is remote ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      await createBooking(user.id, hotelRoom.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: hotelRoom.id,
      });

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket is not paid ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      await createBooking(user.id, hotelRoom.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: hotelRoom.id,
      });

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket has no hotel ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithNoHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      await createBooking(user.id, hotelRoom.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: hotelRoom.id,
      });

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 404 when there is no enrollment ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress();
      const ticketType = await createTicketTypeWithNoHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      await createBooking(user.id, hotelRoom.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: hotelRoom.id,
      });

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when room not found ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      await createBooking(user.id, hotelRoom.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: -1,
      });

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 whem room is unavailable ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      await createBooking(user.id, hotelRoom.id);
      await createBooking(user.id, hotelRoom.id);
      await createBooking(user.id, hotelRoom.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: hotelRoom.id,
      });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: hotelRoom.id,
      });

      expect(response.statusCode).toEqual(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: response.body.bookingId });
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  describe('When token is not valid', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.put('/booking/1');

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();

      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('When token is valid', () => {
    it('should respond with status 403 when booking is not found', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      await createBooking(user.id, hotelRoom.id);

      const response = await server.put('/booking/-1').set('Authorization', `Bearer ${token}`).send({
        roomId: hotelRoom.id,
      });

      expect(response.statusCode).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 404 when roomId does not exists', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, hotelRoom.id);

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({
        roomId: -1,
      });

      expect(response.statusCode).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when room is not available', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, hotelRoom.id);
      await createBooking(user.id, hotelRoom.id);
      await createBooking(user.id, hotelRoom.id);

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({
        roomId: hotelRoom.id,
      });

      expect(response.statusCode).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 when ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      const hotelRoom2 = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, hotelRoom.id);

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({
        roomId: hotelRoom2.id,
      });

      expect(response.statusCode).toEqual(httpStatus.OK);
      expect(response.body).toEqual({ roomId: hotelRoom2.id, bookingId: booking.id });
    });
  });
});
