import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Event } from '../../events/schemas/event.schema';

export type TicketDocument = HydratedDocument<Ticket>;
export type TicketName = 'VIP' | 'Standard' | 'Early Bird';

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ type: Types.ObjectId, ref: Event.name, required: true, index: true })
  event: Types.ObjectId;

  @Prop({ enum: ['VIP', 'Standard', 'Early Bird'], required: true })
  name: TicketName;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ default: 0, min: 0 })
  sold: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
TicketSchema.index({ event: 1, name: 1 }, { unique: true });
