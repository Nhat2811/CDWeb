import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({ ...dto, password });
    return this.buildAuthResponse(user.id, user.email, user.role, user.name);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
    return this.buildAuthResponse(user.id, user.email, user.role, user.name);
  }

  private buildAuthResponse(id: string, email: string, role: string, name: string) {
    const accessToken = this.jwtService.sign({ sub: id, email, role });
    return {
      accessToken,
      user: { id, email, role, name },
    };
  }
}
