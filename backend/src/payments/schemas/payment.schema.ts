import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Booking } from '../../bookings/schemas/booking.schema';
import { User } from '../../users/schemas/user.schema';

export type PaymentDocument = HydratedDocument<Payment>;
export type PaymentMethod = 'card' | 'bank_transfer' | 'e_wallet' | 'cod';
export type PaymentProvider = 'mock' | 'stripe' | 'vnpay' | 'momo' | 'manual';
export type PaymentTransactionStatus = 'pending' | 'success' | 'failed';

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: Booking.name, required: true, index: true })
  booking: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  user: Types.ObjectId;

  @Prop({ enum: ['card', 'bank_transfer', 'e_wallet', 'cod'], required: true })
  method: PaymentMethod;

  @Prop({ enum: ['mock', 'stripe', 'vnpay', 'momo', 'manual'], default: 'mock', index: true })
  provider: PaymentProvider;

  @Prop({ enum: ['pending', 'success', 'failed'], required: true, index: true })
  status: PaymentTransactionStatus;

  @Prop({ required: true, min: 0 })
  originalAmount: number;

  @Prop({ required: true, min: 0 })
  discountAmount: number;

  @Prop()
  discountCode?: string;

  @Prop({ required: true, min: 0 })
  paidAmount: number;

  @Prop({ required: true, unique: true })
  transactionCode: string;

  @Prop()
  message?: string;

  @Prop()
  gatewayTransactionId?: string;

  @Prop()
  paymentUrl?: string;

  @Prop()
  paidAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
