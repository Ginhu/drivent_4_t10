import hotelsService from '@/services/hotels-service';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import bookingsRepository from '@/repositories/booking-repository';
import bookingsService from '@/services/booking-service';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('booking-service', () => {
  describe('function getBookings', () => {
    it('function getbookings throw NotFoundError', async () => {
      jest.spyOn(bookingsRepository, 'getBookings').mockImplementationOnce((): any => {
        return null;
      });
      const promise = bookingsService.getBookings(1);
      expect(bookingsRepository.getBookings).toBeCalled();
      expect(promise).rejects.toEqual({
        name: 'NotFoundError',
        message: 'No result for this search!',
      });
    });

    it('function getbookings return bookings', async () => {
      jest.spyOn(bookingsRepository, 'getBookings').mockImplementationOnce((): any => {
        return {
          id: 1,
          userId: 1,
          roomId: 1,
          createdAt: '24/07/2023',
          updatedAt: '24/07/2023',
        };
      });
      const result = await bookingsService.getBookings(1);
      expect(bookingsRepository.getBookings).toBeCalled();
      expect(result).toEqual({
        id: 1,
        userId: 1,
        roomId: 1,
        createdAt: '24/07/2023',
        updatedAt: '24/07/2023',
      });
    });
  });

  describe('function createBooking', () => {
    it('throw NotFoundError', async () => {
      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
        return null;
      });
      const promise = bookingsService.createBooking(1, 1);
      expect(promise).rejects.toEqual({ name: 'NotFoundError', message: 'No result for this search!' });
    });

    it('throw cannotListHotelsError', async () => {
      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
        return 'mock data';
      });
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
        return null;
      });

      const promise = bookingsService.createBooking(1, 1);
      expect(promise).rejects.toEqual({
        name: 'CannotListHotelsError',
        message: 'Cannot list hotels!',
      });
    });

    it('throw cannotListHotelsError', async () => {
      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
        return 'mock data';
      });
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
        return { status: 'RESERVED' };
      });

      const promise = bookingsService.createBooking(1, 1);
      expect(promise).rejects.toEqual({
        name: 'CannotListHotelsError',
        message: 'Cannot list hotels!',
      });
    });

    it('throw cannotListHotelsError', async () => {
      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
        return 'mock data';
      });
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
        return {
          TicketType: {
            isRemote: true,
          },
        };
      });

      const promise = bookingsService.createBooking(1, 1);
      expect(promise).rejects.toEqual({
        name: 'CannotListHotelsError',
        message: 'Cannot list hotels!',
      });
    });

    it('throw cannotListHotelsError', async () => {
      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
        return 'mock data';
      });
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
        return {
          TicketType: {
            includesHotel: false,
          },
        };
      });

      const promise = bookingsService.createBooking(1, 1);
      expect(promise).rejects.toEqual({
        name: 'CannotListHotelsError',
        message: 'Cannot list hotels!',
      });
    });

    it('throw cannotFindRoomError', async () => {
      jest.spyOn(bookingsRepository, 'findRoomById').mockImplementationOnce((): any => {
        return null;
      });
      jest.spyOn(hotelsService, 'listHotels').mockImplementationOnce((): any => {
        return null;
      });
      const promise = bookingsService.createBooking(1, 1);
      expect(promise).rejects.toEqual({
        name: 'CannotFindRoomError',
        message: 'Cannot find room!',
      });
    });

    it('throw RoomUnavailable', async () => {
      jest.spyOn(bookingsRepository, 'findRoomById').mockImplementationOnce((): any => {
        return { capacity: 3 };
      });
      jest.spyOn(hotelsService, 'listHotels').mockImplementationOnce((): any => {
        return null;
      });
      jest.spyOn(bookingsRepository, 'isRoomAvailable').mockImplementationOnce((): any => {
        return 4;
      });
      const promise = bookingsService.createBooking(1, 1);
      expect(promise).rejects.toEqual({
        name: 'RoomUnavailable',
        message: 'Room Unavailable!',
      });
    });

    it('function bookingsRepository.createBooking is beeing called', async () => {
      jest.spyOn(bookingsRepository, 'findRoomById').mockImplementationOnce((): any => {
        return { capacity: 3 };
      });
      jest.spyOn(hotelsService, 'listHotels').mockImplementationOnce((): any => {
        return null;
      });
      jest.spyOn(bookingsRepository, 'isRoomAvailable').mockImplementationOnce((): any => {
        return 0;
      });
      jest.spyOn(bookingsRepository, 'createBooking').mockImplementationOnce((): any => {
        return null;
      });

      await bookingsService.createBooking(1, 1);

      expect(bookingsRepository.createBooking).toBeCalled();
    });
  });

  describe('function updateBooking', () => {
    it('throw CannotFindBookingError', async () => {
      jest.spyOn(bookingsRepository, 'findBookingById').mockImplementationOnce((): any => {
        return null;
      });

      const promise = bookingsService.updateBooking(1, 1);
      expect(promise).rejects.toEqual({
        name: 'CannotFindBookingError',
        message: 'Cannot find booking!',
      });
    });

    it('throw CannotFindBookingError', async () => {
      jest.spyOn(bookingsRepository, 'findBookingById').mockImplementationOnce((): any => {
        return true;
      });
      jest.spyOn(bookingsRepository, 'findRoomById').mockImplementationOnce((): any => {
        return { capacity: 3 };
      });
      jest.spyOn(bookingsRepository, 'isRoomAvailable').mockImplementation((): any => {
        return 1;
      });
      jest.spyOn(bookingsRepository, 'updateBooking').mockImplementationOnce((): any => {
        return true;
      });

      await bookingsService.updateBooking(1, 1);
      expect(bookingsRepository.updateBooking).toBeCalled();
    });
  });
});
