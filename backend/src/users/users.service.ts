import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './schemas/user.schema';

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async create(input: CreateUserInput) {
    const existing = await this.userModel.exists({ email: input.email });
    if (existing) throw new ConflictException('Email already exists');
    return this.userModel.create(input);
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.userModel.exists({ email: dto.email, _id: { $ne: id } });
      if (existing) throw new ConflictException('Email already exists');
    }
    const user = await this.userModel.findByIdAndUpdate(id, dto, { new: true }).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) throw new UnauthorizedException('Current password is incorrect');
    user.password = await bcrypt.hash(dto.newPassword, 10);
    await user.save();
    return { changed: true };
  }
}
