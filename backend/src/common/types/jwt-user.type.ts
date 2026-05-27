import { UserRole } from '../../users/schemas/user.schema';

export type JwtUser = {
  sub: string;
  email: string;
  role: UserRole;
};
