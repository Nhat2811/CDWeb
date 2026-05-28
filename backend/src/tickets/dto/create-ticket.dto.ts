import { IsIn, IsMongoId, IsNumber, Min } from 'class-validator';
import { TicketName } from '../schemas/ticket.schema';

export class CreateTicketDto {
  @IsMongoId()
  event: string;

  @IsIn(['VIP', 'VVIP', 'Standard', 'Early Bird'])
  name: TicketName;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  quantity: number;
}
