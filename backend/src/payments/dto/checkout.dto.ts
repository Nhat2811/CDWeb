import { IsBoolean, IsIn, IsMongoId, IsOptional } from 'class-validator';
import { IsString, MaxLength } from 'class-validator';

export class CheckoutDto {
  @IsMongoId()
  bookingId: string;

  @IsOptional()
  @IsIn(['card', 'bank_transfer', 'e_wallet', 'cod'])
  method?: 'card' | 'bank_transfer' | 'e_wallet' | 'cod';

  @IsOptional()
  @IsIn(['mock', 'stripe', 'vnpay', 'momo', 'manual'])
  provider?: 'mock' | 'stripe' | 'vnpay' | 'momo' | 'manual';

  @IsOptional()
  @IsBoolean()
  simulateFailure?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  discountCode?: string;
}
