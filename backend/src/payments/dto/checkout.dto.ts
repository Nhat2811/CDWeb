import { IsBoolean, IsIn, IsMongoId, IsOptional } from 'class-validator';

export class CheckoutDto {
  @IsMongoId()
  bookingId: string;

  @IsOptional()
  @IsIn(['card', 'bank_transfer', 'e_wallet'])
  method?: 'card' | 'bank_transfer' | 'e_wallet';

  @IsOptional()
  @IsBoolean()
  simulateFailure?: boolean;
}
