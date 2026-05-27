import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;
export type EventStatus = 'draft' | 'published' | 'cancelled';

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  image?: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ enum: ['draft', 'published', 'cancelled'], default: 'draft', index: true })
  status: EventStatus;
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.index({ title: 'text', description: 'text', location: 'text' });
