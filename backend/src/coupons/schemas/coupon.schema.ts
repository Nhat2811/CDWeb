import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CouponDocument = HydratedDocument<Coupon>;
export type DiscountType = 'percent' | 'fixed';

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  code: string;

  @Prop({ required: true, enum: ['percent', 'fixed'] })
  discountType: DiscountType;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, default: 0, min: 0 })
  used: number;

  @Prop({ required: true })
  validUntil: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
