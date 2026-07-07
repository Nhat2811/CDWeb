import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtUser } from '../common/types/jwt-user.type';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user, dto);
  }

  @Get('my')
  myTickets(@CurrentUser() user: JwtUser) {
    return this.bookingsService.findMy(user.sub);
  }

  @Get('my-tickets')
  myTicketsAlias(@CurrentUser() user: JwtUser) {
    return this.bookingsService.findMy(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.bookingsService.findOneForUser(id, user);
  }

  @Patch(':id/pay')
  pay(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.bookingsService.pay(id, user);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.bookingsService.cancel(id, user);
  }

  @Patch(':id/check-in')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  checkIn(@Param('id') id: string) {
    return this.bookingsService.checkIn(id);
  }

  @Post('check-in-qr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  checkInQr(@Body() payload: { user: string; event: string; ticket: string }) {
    return this.bookingsService.checkInByPayload(payload);
  }
}
