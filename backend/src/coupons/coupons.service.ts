import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { Coupon } from './schemas/coupon.schema';

@Injectable()
export class CouponsService {
  constructor(@InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>) {}

  async create(dto: CreateCouponDto) {
    const existing = await this.couponModel.findOne({ code: dto.code.toUpperCase() }).exec();
    if (existing) throw new BadRequestException('Coupon code already exists');
    
    return this.couponModel.create({
      code: dto.code.toUpperCase(),
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      quantity: dto.quantity,
      validUntil: new Date(dto.validUntil),
    });
  }

  findAll() {
    return this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  findActive() {
    return this.couponModel.find({
      validUntil: { $gt: new Date() },
      $expr: { $lt: ['$used', '$quantity'] }
    }).sort({ validUntil: 1 }).select('code discountType discountValue validUntil').exec();
  }

  async remove(id: string) {
    const coupon = await this.couponModel.findByIdAndDelete(id).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async validateAndUse(code: string, totalPrice: number): Promise<{ code?: string; amount: number }> {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return { code: undefined, amount: 0 };

    const coupon = await this.couponModel.findOne({ code: normalized }).exec();
    if (!coupon) throw new BadRequestException('Discount code is invalid');

    if (new Date() > coupon.validUntil) {
      throw new BadRequestException('Discount code is expired');
    }

    if (coupon.used >= coupon.quantity) {
      throw new BadRequestException('Discount code has reached its usage limit');
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
      discountAmount = Math.round(totalPrice * (coupon.discountValue / 100));
    } else {
      discountAmount = Math.min(coupon.discountValue, totalPrice);
    }

    return { code: normalized, amount: discountAmount };
  }

  async markAsUsed(code: string) {
    if (!code) return;
    await this.couponModel.updateOne(
      { code: code.toUpperCase() },
      { $inc: { used: 1 } }
    ).exec();
  }
}
