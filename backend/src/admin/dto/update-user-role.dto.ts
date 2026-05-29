import { IsIn } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class UpdateUserRoleDto {
  @IsIn(['admin', 'customer'])
  role: UserRole;
}
