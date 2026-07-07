import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Get('active')
  findActive() {
    return this.couponsService.findActive();
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.couponsService.findAll();
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
