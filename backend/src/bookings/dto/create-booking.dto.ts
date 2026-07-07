import { IsArray, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookingDto {
  @IsMongoId()
  event: string;

  @IsMongoId()
  ticket: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seats?: string[];
}
