import { Injectable } from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { EventsService } from '../events/events.service';
import { TicketsService } from '../tickets/tickets.service';
import { UsersService } from '../users/users.service';
import { BookingStatus } from '../bookings/schemas/booking.schema';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly ticketsService: TicketsService,
    private readonly bookingsService: BookingsService,
    private readonly usersService: UsersService,
  ) {}

  async dashboard() {
    const [totalEvents, totalTicketsSold, totalRevenue, recentBookings, users] = await Promise.all([
      this.eventsService.count(),
      this.ticketsService.soldCount(),
      this.bookingsService.revenue(),
      this.bookingsService.recent(),
      this.usersService.findAll(),
    ]);
    return { totalEvents, totalTicketsSold, totalRevenue, totalUsers: users.length, recentBookings };
  }

  bookings() {
    return this.bookingsService.findAll();
  }

  updateBookingStatus(id: string, status: BookingStatus) {
    return this.bookingsService.updateStatus(id, status);
  }

  users() {
    return this.usersService.findAll();
  }

  updateUserRole(id: string, role: UserRole) {
    return this.usersService.updateRole(id, role);
  }

  removeUser(id: string) {
    return this.usersService.remove(id);
  }
}
