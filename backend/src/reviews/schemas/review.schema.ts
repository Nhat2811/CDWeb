import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Event } from '../../events/schemas/event.schema';
import { Booking } from '../../bookings/schemas/booking.schema';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Event | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true, unique: true })
  booking: Booking | Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ trim: true })
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
