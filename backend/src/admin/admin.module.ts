import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { EventsModule } from '../events/events.module';
import { TicketsModule } from '../tickets/tickets.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [EventsModule, TicketsModule, BookingsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
