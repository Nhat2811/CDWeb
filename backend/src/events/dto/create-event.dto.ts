import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class CreateEventDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  location: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsString()
  category: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'cancelled'])
  status?: EventStatus;
}
