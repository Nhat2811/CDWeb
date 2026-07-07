import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const password = await bcrypt.hash(dto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await this.usersService.create({ ...dto, password, verificationToken });
    
    // Send verification email
    const frontendUrl = this.configService.get<string>('FRONTEND_URL')?.split(',')[0] ?? 'http://localhost:3000';
    const verifyLink = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;
    
    // Since we don't have a template for verify email yet, we can log it or use MailService to send a generic email.
    const htmlBody = `
      <h2>Xác thực Email của bạn</h2>
      <p>Chào bạn,</p>
      <p>Vui lòng click vào link bên dưới để xác thực địa chỉ email của bạn:</p>
      <p><a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background-color:#14b8a6;color:white;text-decoration:none;border-radius:5px;">Xác Thực Email</a></p>
      <p>Hoặc copy link này dán vào trình duyệt: <br> ${verifyLink}</p>
    `;
    await this.mailService.sendGenericEmail(user.email, 'Xác thực Email - Event Booking', htmlBody, true);

    return this.buildAuthResponse(user.id, user.email, user.role, user.name);
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.usersService.findByVerificationToken(dto.token);
    if (!user) throw new BadRequestException('Invalid or expired verification token');
    
    user.isEmailVerified = true;
    user.verificationToken = null;
    await user.save();
    return { success: true, message: 'Email verified successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) return { success: true, message: 'If email exists, reset link sent' }; // Do not leak existence

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const frontendUrl = this.configService.get<string>('FRONTEND_URL')?.split(',')[0] ?? 'http://localhost:3000';
    const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;
    
    const htmlBody = `
      <h2>Đặt lại mật khẩu</h2>
      <p>Chào bạn,</p>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      <p>Click vào nút bên dưới để đổi mật khẩu mới:</p>
      <p><a href="${resetLink}" style="display:inline-block;padding:10px 20px;background-color:#14b8a6;color:white;text-decoration:none;border-radius:5px;">Đặt Lại Mật Khẩu</a></p>
      <p>Hoặc copy link này dán vào trình duyệt: <br> ${resetLink}</p>
    `;
    await this.mailService.sendGenericEmail(user.email, 'Đặt lại mật khẩu - Event Booking', htmlBody, true);

    return { success: true, message: 'If email exists, reset link sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(dto.token);
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    user.password = await bcrypt.hash(dto.password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { success: true, message: 'Password reset successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
    
    // Optional: block login if not verified
    // if (!user.isEmailVerified) throw new UnauthorizedException('Please verify your email first');

    return this.buildAuthResponse(user.id, user.email, user.role, user.name);
  }

  private buildAuthResponse(id: string, email: string, role: string, name: string) {
    const accessToken = this.jwtService.sign({ sub: id, email, role });
    return {
      accessToken,
      user: { id, email, role, name },
    };
  }

  async googleAuth(dto: import('./dto/google-auth.dto').GoogleAuthDto) {
    const { OAuth2Client } = require('google-auth-library');
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID') || 'YOUR_GOOGLE_CLIENT_ID';
    const client = new OAuth2Client(clientId);
    
    const ticket = await client.verifyIdToken({
      idToken: dto.token,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    let user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await this.usersService.create({
        name: payload.name || 'Người dùng Google',
        email: payload.email,
        password: hashedPassword,
      });
      user.isEmailVerified = true;
      if (payload.picture) {
        user.avatar = payload.picture;
      }
      await user.save();
    }

    return this.buildAuthResponse(user.id, user.email, user.role, user.name);
  }

  async facebookAuth(dto: import('./dto/facebook-auth.dto').FacebookAuthDto) {
    const axios = require('axios');
    try {
      const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${dto.accessToken}`);
      const payload = response.data;
      if (!payload || !payload.id) {
        throw new UnauthorizedException('Invalid Facebook token');
      }

      const email = payload.email || `${payload.id}@facebook.com`;

      let user = await this.usersService.findByEmail(email);
      if (!user) {
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        user = await this.usersService.create({
          name: payload.name || 'Người dùng Facebook',
          email: email,
          password: hashedPassword,
        });
        user.isEmailVerified = true;
        if (payload.picture?.data?.url) {
          user.avatar = payload.picture.data.url;
        }
        await user.save();
      }

      return this.buildAuthResponse(user.id, user.email, user.role, user.name);
    } catch (error) {
      throw new UnauthorizedException('Invalid Facebook token');
    }
  }
}
