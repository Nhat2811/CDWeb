import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtUser } from '../common/types/jwt-user.type';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('checkout')
  checkout(@CurrentUser() user: JwtUser, @Body() dto: CheckoutDto) {
    return this.bookingsService.pay(dto.bookingId, user);
  }
}
