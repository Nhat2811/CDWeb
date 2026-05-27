import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './schemas/event.schema';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private readonly eventModel: Model<Event>) {}

  create(dto: CreateEventDto) {
    return this.eventModel.create(dto);
  }

  findAll(query: QueryEventsDto) {
    const filter: FilterQuery<Event> = {};
    if (query.category) filter.category = query.category;
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { location: { $regex: query.search, $options: 'i' } },
      ];
    }
    return this.eventModel.find(filter).sort({ startDate: 1 }).exec();
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
