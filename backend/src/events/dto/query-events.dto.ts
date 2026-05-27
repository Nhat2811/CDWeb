import { IsIn, IsOptional, IsString } from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class QueryEventsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'cancelled'])
  status?: EventStatus;
}
