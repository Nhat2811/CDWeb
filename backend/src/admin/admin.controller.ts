import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get('dashboard-charts')
  dashboardCharts() {
    return this.adminService.dashboardCharts();
  }

  @Get('bookings')
  @Roles('admin', 'staff')
  bookings() {
    return this.adminService.bookings();
  }

  @Patch('bookings/:id/confirm-payment')
  @Roles('admin', 'staff')
  confirmPayment(@Param('id') id: string) {
    return this.adminService.confirmPayment(id);
  }

  @Patch('bookings/:id/status')
  @Roles('admin', 'staff')
  updateBookingStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.adminService.updateBookingStatus(id, dto.status);
  }

  @Get('users')
  users() {
    return this.adminService.users();
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Delete('users/:id')
  removeUser(@Param('id') id: string) {
    return this.adminService.removeUser(id);
  }
}
