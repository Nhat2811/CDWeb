import { IsEnum, IsNumber, IsString, Min } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(['percent', 'fixed'])
  discountType: 'percent' | 'fixed';

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  validUntil: string;
}
