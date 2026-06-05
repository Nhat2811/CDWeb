import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Ticket } from '../tickets/schemas/ticket.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './schemas/event.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Ticket.name) private readonly ticketModel: Model<Ticket>,
  ) {}

  create(dto: CreateEventDto) {
    return this.eventModel.create(dto);
  }

  async findAll(query: QueryEventsDto) {
    const filter: FilterQuery<Event> = {};
    if (query.category) filter.category = query.category;
    if (query.status) filter.status = query.status;
    if (query.location) filter.location = { $regex: query.location, $options: 'i' };
    if (query.dateFrom || query.dateTo) {
      filter.startDate = {};
      if (query.dateFrom) filter.startDate.$gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const endOfDay = new Date(query.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        filter.startDate.$lte = endOfDay;
      }
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { location: { $regex: query.search, $options: 'i' } },
      ];
    }

    const minPrice = query.minPrice === undefined ? undefined : Number(query.minPrice);
    const maxPrice = query.maxPrice === undefined ? undefined : Number(query.maxPrice);
    const priceFilter: FilterQuery<Ticket> = {};
    if (minPrice !== undefined || maxPrice !== undefined) {
      priceFilter.price = {};
      if (minPrice !== undefined) priceFilter.price.$gte = minPrice;
      if (maxPrice !== undefined) priceFilter.price.$lte = maxPrice;
      const eventIds = await this.ticketModel.distinct('event', priceFilter).exec();
      filter._id = { $in: eventIds };
    }

    const events = await this.eventModel.find(filter).sort({ startDate: 1 }).lean().exec();
    if (events.length === 0) return [];

    const stats = await this.ticketModel
      .aggregate<{
        _id: Types.ObjectId;
        minTicketPrice: number;
        maxTicketPrice: number;
        availableTickets: number;
      }>([
        { $match: { event: { $in: events.map((event) => event._id) }, ...priceFilter } },
        {
          $group: {
            _id: '$event',
            minTicketPrice: { $min: '$price' },
            maxTicketPrice: { $max: '$price' },
            availableTickets: { $sum: { $max: [{ $subtract: ['$quantity', '$sold'] }, 0] } },
          },
        },
      ])
      .exec();
    const statsByEvent = new Map(stats.map((item) => [item._id.toString(), item]));

    return events.map((event) => ({
      ...event,
      minTicketPrice: statsByEvent.get(event._id.toString())?.minTicketPrice ?? 0,
      maxTicketPrice: statsByEvent.get(event._id.toString())?.maxTicketPrice ?? 0,
      availableTickets: statsByEvent.get(event._id.toString())?.availableTickets ?? 0,
    }));
  }

  async findOne(id: string) {
    const event = await this.eventModel.findById(id).exec();
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.eventModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async remove(id: string) {
    const event = await this.eventModel.findByIdAndDelete(id).exec();
    if (!event) throw new NotFoundException('Event not found');
    return { deleted: true };
  }

  count() {
    return this.eventModel.countDocuments().exec();
  }
}
