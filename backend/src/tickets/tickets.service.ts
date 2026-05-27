import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './schemas/ticket.schema';

@Injectable()
export class TicketsService {
  constructor(@InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>) {}

  create(dto: CreateTicketDto) {
    return this.ticketModel.create(dto);
  }

  findByEvent(eventId: string) {
    return this.ticketModel.find({ event: eventId }).sort({ price: 1 }).exec();
  }

  async findOne(id: string) {
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (dto.quantity !== undefined && dto.quantity < ticket.sold) {
      throw new BadRequestException('Quantity cannot be lower than sold tickets');
    }
    Object.assign(ticket, dto);
    return ticket.save();
  }

  async remove(id: string) {
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.sold > 0) throw new BadRequestException('Cannot delete a ticket with sales');
    await ticket.deleteOne();
    return { deleted: true };
  }

  async reserve(ticketId: string, quantity: number) {
    const ticket = await this.ticketModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(ticketId),
          $expr: { $gte: [{ $subtract: ['$quantity', '$sold'] }, quantity] },
        },
        { $inc: { sold: quantity } },
        { new: true },
      )
      .exec();
    if (!ticket) throw new BadRequestException('Not enough tickets available');
    return ticket;
  }

  async release(ticketId: string, quantity: number) {
    await this.ticketModel.findByIdAndUpdate(ticketId, { $inc: { sold: -quantity } }).exec();
  }

  async soldCount() {
    const [result] = await this.ticketModel.aggregate<{ total: number }>([
      { $group: { _id: null, total: { $sum: '$sold' } } },
    ]);
    return result?.total ?? 0;
  }
}
