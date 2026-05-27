import { IsMongoId, IsNumber, Min } from 'class-validator';

export class CreateBookingDto {
  @IsMongoId()
  event: string;

  @IsMongoId()
  ticket: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
