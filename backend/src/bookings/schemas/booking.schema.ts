import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Event } from '../../events/schemas/event.schema';
import { Ticket } from '../../tickets/schemas/ticket.schema';
import { User } from '../../users/schemas/user.schema';

export type BookingDocument = HydratedDocument<Booking>;
export type BookingStatus = 'pending' | 'paid' | 'cancelled' | 'used';

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Event.name, required: true })
  event: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Ticket.name, required: true })
  ticket: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ enum: ['pending', 'paid', 'cancelled', 'used'], default: 'pending', index: true })
  status: BookingStatus;

  @Prop({ required: true })
  qrCode: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
