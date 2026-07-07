import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as QRCode from 'qrcode';
import { JwtUser } from '../common/types/jwt-user.type';
import { TicketsService } from '../tickets/tickets.service';
import { EventsService } from '../events/events.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking, BookingStatus } from './schemas/booking.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    private readonly ticketsService: TicketsService,
    private readonly eventsService: EventsService,
  ) {}

  async create(user: JwtUser, dto: CreateBookingDto) {
    const ticket = await this.ticketsService.findOne(dto.ticket);
    if (ticket.event.toString() !== dto.event) {
      throw new BadRequestException('Ticket does not belong to event');
    }

    const event = await this.eventsService.findOne(dto.event);
    if (dto.seats && dto.seats.length > 0) {
      if (dto.seats.length !== dto.quantity) {
        throw new BadRequestException('Number of seats must match ticket quantity');
      }
      
      const alreadyBooked = event.bookedSeats || [];
      const conflicting = dto.seats.filter(seat => alreadyBooked.includes(seat));
      
      if (conflicting.length > 0) {
        throw new BadRequestException(`Seats ${conflicting.join(', ')} are already booked`);
      }
      
      // Reserve seats on event temporarily (or permanently since it's just an array)
      await this.eventsService.update(event._id.toString(), {
        bookedSeats: [...alreadyBooked, ...dto.seats]
      } as any);
    }

    await this.ticketsService.reserve(dto.ticket, dto.quantity);
    const totalPrice = ticket.price * dto.quantity;
    const qrCode = await QRCode.toDataURL(
      JSON.stringify({ user: user.sub, event: dto.event, ticket: dto.ticket, quantity: dto.quantity }),
    );
    return this.bookingModel.create({
      user: new Types.ObjectId(user.sub),
      event: new Types.ObjectId(dto.event),
      ticket: new Types.ObjectId(dto.ticket),
      quantity: dto.quantity,
      seats: dto.seats || [],
      totalPrice,
      discountAmount: 0,
      status: 'pending',
      qrCode,
    });
  }

  findMy(userId: string) {
    return this.bookingModel
      .find({ user: new Types.ObjectId(userId) })
      .populate('event')
      .populate('ticket')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOneForUser(id: string, user: JwtUser) {
    const booking = await this.findOwnedBooking(id, user);
    return booking.populate(['event', 'ticket']);
  }

  async pay(id: string, user: JwtUser, payment?: { totalPrice?: number; discountAmount?: number; discountCode?: string }) {
    const booking = await this.findOwnedBooking(id, user);
    if (booking.status === 'cancelled') throw new BadRequestException('Booking is cancelled');
    if (booking.status === 'paid') {
      throw new BadRequestException('Booking is already paid');
    }
    if (booking.status !== 'pending') {
      throw new BadRequestException('Only pending bookings can be paid');
    }
    if (payment?.totalPrice !== undefined) booking.totalPrice = payment.totalPrice;
    if (payment?.discountAmount !== undefined) booking.discountAmount = payment.discountAmount;
    booking.discountCode = payment?.discountCode;
    booking.status = 'paid';
    booking.paidAt = new Date();
    booking.qrCode = await QRCode.toDataURL(
      JSON.stringify({
        booking: booking._id.toString(),
        user: booking.user.toString(),
        event: booking.event.toString(),
        ticket: booking.ticket.toString(),
        quantity: booking.quantity,
        status: 'paid',
        totalPrice: booking.totalPrice,
        issuedAt: new Date().toISOString(),
      }),
    );
    const savedBooking = await booking.save();
    return savedBooking.populate(['event', 'ticket', 'user']);
  }

  async cancel(id: string, user: JwtUser) {
    const booking = await this.findOwnedBooking(id, user);
    if (booking.status === 'cancelled') return booking;
    if (booking.status === 'paid') throw new BadRequestException('Paid booking cannot be cancelled');
    booking.status = 'cancelled';
    await booking.save();
    await this.ticketsService.release(booking.ticket.toString(), booking.quantity);

    if (booking.seats && booking.seats.length > 0) {
      const event = await this.eventsService.findOne(booking.event.toString());
      if (event) {
        const remainingSeats = (event.bookedSeats || []).filter(s => !booking.seats.includes(s));
        await this.eventsService.update(event._id.toString(), {
          bookedSeats: remainingSeats
        } as any);
      }
    }

    return booking;
  }

  async recent(limit = 8) {
    return this.bookingModel
      .find()
      .populate('user', 'name email')
      .populate('event', 'title startDate')
      .populate('ticket', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  findAll() {
    return this.bookingModel
      .find()
      .populate('user', 'name email phone role')
      .populate('event', 'title startDate location image')
      .populate('ticket', 'name price')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(id: string, status: BookingStatus) {
    const booking = await this.bookingModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('user', 'name email phone role')
      .populate('event', 'title startDate location image')
      .populate('ticket', 'name price')
      .exec();
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async checkIn(id: string) {
    const booking = await this.bookingModel
      .findById(id)
      .populate('user', 'name email phone role')
      .populate('event', 'title startDate location image')
      .populate('ticket', 'name price')
      .exec();
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'used') return booking;
    if (booking.status !== 'paid') {
      throw new BadRequestException('Only paid bookings can be checked in');
    }
    booking.status = 'used';
    booking.checkedInAt = new Date();
    return booking.save();
  }

  async checkInByPayload(payload: { user: string; event: string; ticket: string }) {
    const booking = await this.bookingModel
      .findOne({
        user: new Types.ObjectId(payload.user),
        event: new Types.ObjectId(payload.event),
        ticket: new Types.ObjectId(payload.ticket),
        status: 'paid'
      })
      .populate('user', 'name email phone role')
      .populate('event', 'title startDate location image')
      .populate('ticket', 'name price')
      .exec();
    
    if (!booking) {
      // Also check if they already checked in
      const alreadyCheckedIn = await this.bookingModel.findOne({
        user: new Types.ObjectId(payload.user),
        event: new Types.ObjectId(payload.event),
        ticket: new Types.ObjectId(payload.ticket),
        status: 'used'
      });
      if (alreadyCheckedIn) {
        throw new BadRequestException('This ticket has already been checked in');
      }
      throw new NotFoundException('No valid paid booking found for this ticket');
    }
    
    booking.status = 'used';
    booking.checkedInAt = new Date();
    return booking.save();
  }

  async revenue() {
    const [result] = await this.bookingModel.aggregate<{ total: number }>([
      { $match: { status: { $in: ['paid', 'used'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    return result?.total ?? 0;
  }

  async profileStats(userId: string) {
    const [result] = await this.bookingModel.aggregate<{
      totalBookings: number;
      paidBookings: number;
      pendingBookings: number;
      cancelledBookings: number;
      totalTickets: number;
      totalSpent: number;
    }>([
      { $match: { user: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          paidBookings: { $sum: { $cond: [{ $in: ['$status', ['paid', 'used']] }, 1, 0] } },
          pendingBookings: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          cancelledBookings: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          totalTickets: { $sum: { $cond: [{ $in: ['$status', ['paid', 'used']] }, '$quantity', 0] } },
          totalSpent: { $sum: { $cond: [{ $in: ['$status', ['paid', 'used']] }, '$totalPrice', 0] } },
        },
      },
    ]);
    return (
      result ?? {
        totalBookings: 0,
        paidBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        totalTickets: 0,
        totalSpent: 0,
      }
    );
  }

  private async findOwnedBooking(id: string, user: JwtUser) {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) throw new NotFoundException('Booking not found');
    if (user.role !== 'admin' && booking.user.toString() !== user.sub) {
      throw new ForbiddenException('You cannot access this booking');
    }
    return booking;
  }

  async getChartData() {
    const revenueByMonth = await this.bookingModel.aggregate([
      { $match: { status: { $in: ['paid', 'used'] } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          value: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const formattedRevenue = revenueByMonth.map((r) => ({
      name: months[r._id - 1],
      value: r.value,
    }));

    const ticketsByType = await this.bookingModel.aggregate([
      { $match: { status: { $in: ['paid', 'used'] } } },
      {
        $lookup: {
          from: 'tickets',
          localField: 'ticket',
          foreignField: '_id',
          as: 'ticketInfo',
        },
      },
      { $unwind: '$ticketInfo' },
      {
        $group: {
          _id: '$ticketInfo.name',
          value: { $sum: '$quantity' },
        },
      },
    ]);
    const formattedTickets = ticketsByType.map((t) => ({
      name: t._id,
      value: t.value,
    }));

    return { revenueByMonth: formattedRevenue, ticketsByType: formattedTickets };
  }
}
