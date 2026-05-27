import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as QRCode from 'qrcode';
import { JwtUser } from '../common/types/jwt-user.type';
import { TicketsService } from '../tickets/tickets.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './schemas/booking.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    private readonly ticketsService: TicketsService,
  ) {}

  async create(user: JwtUser, dto: CreateBookingDto) {
    const ticket = await this.ticketsService.findOne(dto.ticket);
    if (ticket.event.toString() !== dto.event) {
      throw new BadRequestException('Ticket does not belong to event');
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
      totalPrice,
      status: 'pending',
      qrCode,
    });
  }

  findMy(userId: string) {
    return this.bookingModel
      .find({ user: userId })
      .populate('event')
      .populate('ticket')
      .sort({ createdAt: -1 })
      .exec();
  }

  async pay(id: string, user: JwtUser) {
    const booking = await this.findOwnedBooking(id, user);
    if (booking.status === 'cancelled') throw new BadRequestException('Booking is cancelled');
    booking.status = 'paid';
    return booking.save();
  }

  async cancel(id: string, user: JwtUser) {
    const booking = await this.findOwnedBooking(id, user);
    if (booking.status === 'cancelled') return booking;
    if (booking.status === 'paid') throw new BadRequestException('Paid booking cannot be cancelled');
    booking.status = 'cancelled';
    await booking.save();
    await this.ticketsService.release(booking.ticket.toString(), booking.quantity);
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

  async revenue() {
    const [result] = await this.bookingModel.aggregate<{ total: number }>([
      { $match: { status: 'paid' } },
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
          paidBookings: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
          pendingBookings: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          cancelledBookings: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          totalTickets: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 0, '$quantity'] } },
          totalSpent: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$totalPrice', 0] } },
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
}
