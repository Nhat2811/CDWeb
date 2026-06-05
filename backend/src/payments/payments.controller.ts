import { Body, Controller, Get, Headers, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtUser } from '../common/types/jwt-user.type';
import { CheckoutDto } from './dto/checkout.dto';
import { PaymentsService } from './payments.service';

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  checkout(@CurrentUser() user: JwtUser, @Body() dto: CheckoutDto) {
    return this.paymentsService.checkout(user, dto);
  }

  @Get('config')
  configStatus() {
    return this.paymentsService.configStatus();
  }

  @Get('stripe/return')
  async stripeReturn(@Query('session_id') sessionId: string, @Res() response: Response) {
    await this.paymentsService.completeStripeSession(sessionId);
    return response.redirect(`${this.frontendBaseUrl()}/payments/result?provider=stripe&status=success`);
  }

  @Post('stripe/webhook')
  stripeWebhook(@Req() request: RawBodyRequest, @Headers('stripe-signature') signature?: string) {
    return this.paymentsService.handleStripeWebhook(request.rawBody ?? Buffer.from(JSON.stringify(request.body)), signature);
  }

  @Get('vnpay/return')
  async vnpayReturn(@Query() query: Record<string, string>, @Res() response: Response) {
    const result = await this.paymentsService.handleVnpayReturn(query);
    const status = 'status' in result && result.status === 'failed' ? 'failed' : 'success';
    return response.redirect(`${this.frontendBaseUrl()}/payments/result?provider=vnpay&status=${status}`);
  }

  @Post('momo/ipn')
  momoIpn(@Body() body: Record<string, string | number>) {
    return this.paymentsService.handleMomoIpn(body);
  }

  @Get('momo/return')
  async momoReturn(@Query() query: Record<string, string | number>, @Res() response: Response) {
    if (query.signature) await this.paymentsService.handleMomoIpn(query);
    const status = Number(query.resultCode) === 0 ? 'success' : 'failed';
    return response.redirect(`${this.frontendBaseUrl()}/payments/result?provider=momo&status=${status}`);
  }

  @Get(':bookingId/status')
  @UseGuards(JwtAuthGuard)
  status(@CurrentUser() user: JwtUser, @Param('bookingId') bookingId: string) {
    return this.paymentsService.status(user, bookingId);
  }

  @Get(':bookingId/history')
  @UseGuards(JwtAuthGuard)
  history(@CurrentUser() user: JwtUser, @Param('bookingId') bookingId: string) {
    return this.paymentsService.history(user, bookingId);
  }

  private frontendBaseUrl() {
    return this.config.get<string>('FRONTEND_URL')?.split(',')[0] ?? 'http://localhost:3000';
  }
}
