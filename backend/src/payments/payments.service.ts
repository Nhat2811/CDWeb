import { BadRequestException, Injectable } from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { JwtUser } from '../common/types/jwt-user.type';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly bookingsService: BookingsService) {}

  async checkout(user: JwtUser, dto: CheckoutDto) {
    const booking = await this.bookingsService.findOneForUser(dto.bookingId, user);

    if (booking.status === 'cancelled') {
      throw new BadRequestException('Booking is cancelled');
    }

    if (booking.status === 'paid') {
      throw new BadRequestException('Booking is already paid');
    }

    if (dto.simulateFailure) {
      throw new BadRequestException('Mock payment failed. Please try again.');
    }

    const paidBooking = await this.bookingsService.pay(dto.bookingId, user);

    return {
      bookingId: paidBooking._id,
      method: dto.method ?? 'card',
      status: paidBooking.status,
      qrCode: paidBooking.qrCode,
      booking: paidBooking,
    };
  }

  async status(user: JwtUser, bookingId: string) {
    const booking = await this.bookingsService.findOneForUser(bookingId, user);

    return {
      bookingId: booking._id,
      status: booking.status,
      qrCode: booking.qrCode,
      booking,
    };
  }
}
