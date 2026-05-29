import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtUser } from '../common/types/jwt-user.type';
import { CheckoutDto } from './dto/checkout.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  checkout(@CurrentUser() user: JwtUser, @Body() dto: CheckoutDto) {
    return this.paymentsService.checkout(user, dto);
  }

  @Get(':bookingId/status')
  status(@CurrentUser() user: JwtUser, @Param('bookingId') bookingId: string) {
    return this.paymentsService.status(user, bookingId);
  }
}
