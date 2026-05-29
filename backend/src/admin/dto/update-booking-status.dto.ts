import { IsIn } from 'class-validator';
import { BookingStatus } from '../../bookings/schemas/booking.schema';

export class UpdateBookingStatusDto {
  @IsIn(['pending', 'paid', 'cancelled', 'used'])
  status: BookingStatus;
}
