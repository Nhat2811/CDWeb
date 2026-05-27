import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
}
