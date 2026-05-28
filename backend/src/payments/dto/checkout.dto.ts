import { IsMongoId } from 'class-validator';

export class CheckoutDto {
  @IsMongoId()
  bookingId: string;
}
