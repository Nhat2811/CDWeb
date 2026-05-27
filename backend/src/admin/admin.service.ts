import { Injectable } from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { EventsService } from '../events/events.service';
import { TicketsService } from '../tickets/tickets.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly ticketsService: TicketsService,
    private readonly bookingsService: BookingsService,
  ) {}

  async dashboard() {
    const [totalEvents, totalTicketsSold, totalRevenue, recentBookings] = await Promise.all([
      this.eventsService.count(),
      this.ticketsService.soldCount(),
      this.bookingsService.revenue(),
      this.bookingsService.recent(),
    ]);
    return { totalEvents, totalTicketsSold, totalRevenue, recentBookings };
  }
}
