import { IsBoolean, IsIn, IsMongoId, IsOptional } from 'class-validator';
import { IsString, MaxLength } from 'class-validator';

export class CheckoutDto {
  @IsMongoId()
  bookingId: string;

  @IsOptional()
  @IsIn(['card', 'bank_transfer', 'e_wallet'])
  method?: 'card' | 'bank_transfer' | 'e_wallet';

  @IsOptional()
  @IsIn(['mock', 'stripe', 'vnpay', 'momo'])
  provider?: 'mock' | 'stripe' | 'vnpay' | 'momo';

  @IsOptional()
  @IsBoolean()
  simulateFailure?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  discountCode?: string;
}
