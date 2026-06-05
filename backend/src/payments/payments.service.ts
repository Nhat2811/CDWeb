import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { createHmac } from 'crypto';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { BookingsService } from '../bookings/bookings.service';
import { JwtUser } from '../common/types/jwt-user.type';
import { CheckoutDto } from './dto/checkout.dto';
import { Payment, PaymentMethod, PaymentProvider, PaymentTransactionStatus } from './schemas/payment.schema';

type CalculatedDiscount = {
  code?: string;
  amount: number;
};

@Injectable()
export class PaymentsService {
  private readonly frontendUrl: string;
  private readonly backendUrl: string;

  constructor(
    private readonly bookingsService: BookingsService,
    private readonly config: ConfigService,
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
  ) {
    this.frontendUrl = this.config.get<string>('FRONTEND_URL')?.split(',')[0] ?? 'http://localhost:3000';
    this.backendUrl = this.config.get<string>('BACKEND_PUBLIC_URL') ?? `http://localhost:${this.config.get<number>('PORT') ?? 4000}`;
  }

  async checkout(user: JwtUser, dto: CheckoutDto) {
    const booking = await this.bookingsService.findOneForUser(dto.bookingId, user);
    const method = dto.method ?? 'card';
    const provider = dto.provider ?? 'mock';
    const discount = this.calculateDiscount(booking.totalPrice, dto.discountCode);
    const paidAmount = Math.max(booking.totalPrice - discount.amount, 0);

    if (booking.status === 'cancelled') throw new BadRequestException('Booking is cancelled');
    if (booking.status === 'paid' || booking.status === 'used') throw new BadRequestException('Booking is already paid');

    if (provider !== 'mock') {
      return this.createGatewayCheckout({
        provider,
        method,
        bookingId: dto.bookingId,
        userId: user.sub,
        originalAmount: booking.totalPrice,
        discount,
        paidAmount,
        eventTitle: typeof booking.event === 'object' && 'title' in booking.event ? String(booking.event.title) : 'Event booking',
      });
    }

    if (dto.simulateFailure) {
      await this.createTransaction({
        bookingId: dto.bookingId,
        userId: user.sub,
        method,
        provider,
        status: 'failed',
        originalAmount: booking.totalPrice,
        discountAmount: discount.amount,
        discountCode: discount.code,
        paidAmount: 0,
        message: 'Mock payment failed. Please try again.',
      });
      throw new BadRequestException('Mock payment failed. Please try again.');
    }

    const paidBooking = await this.bookingsService.pay(dto.bookingId, user, {
      totalPrice: paidAmount,
      discountAmount: discount.amount,
      discountCode: discount.code,
    });
    const transaction = await this.createTransaction({
      bookingId: dto.bookingId,
      userId: user.sub,
      method,
      provider,
      status: 'success',
      originalAmount: booking.totalPrice,
      discountAmount: discount.amount,
      discountCode: discount.code,
      paidAmount,
      message: 'Mock payment completed. Confirmation email queued.',
      paidAt: new Date(),
    });

    return this.buildCheckoutResponse(paidBooking, method, provider, transaction);
  }

  configStatus() {
    const hasStripeSecret = Boolean(this.config.get<string>('STRIPE_SECRET_KEY'));
    const hasStripeWebhookSecret = Boolean(this.config.get<string>('STRIPE_WEBHOOK_SECRET'));
    const hasVnpayConfig = Boolean(this.config.get<string>('VNPAY_TMN_CODE') && this.config.get<string>('VNPAY_HASH_SECRET'));
    const hasMomoConfig = Boolean(
      this.config.get<string>('MOMO_PARTNER_CODE') &&
        this.config.get<string>('MOMO_ACCESS_KEY') &&
        this.config.get<string>('MOMO_SECRET_KEY'),
    );

    return {
      mock: { enabled: true, reason: 'Available for local demo' },
      stripe: {
        enabled: hasStripeSecret,
        webhookReady: hasStripeWebhookSecret,
        reason: hasStripeSecret ? undefined : 'Missing STRIPE_SECRET_KEY in backend environment',
      },
      vnpay: {
        enabled: hasVnpayConfig,
        reason: hasVnpayConfig ? undefined : 'Missing VNPAY_TMN_CODE or VNPAY_HASH_SECRET in backend environment',
      },
      momo: {
        enabled: hasMomoConfig,
        reason: hasMomoConfig ? undefined : 'Missing MOMO_PARTNER_CODE, MOMO_ACCESS_KEY or MOMO_SECRET_KEY in backend environment',
      },
    };
  }

  async status(user: JwtUser, bookingId: string) {
    const booking = await this.bookingsService.findOneForUser(bookingId, user);
    const latestPayment = await this.paymentModel.findOne({ booking: new Types.ObjectId(bookingId) }).sort({ createdAt: -1 }).exec();

    return {
      bookingId: booking._id,
      status: booking.status,
      qrCode: booking.qrCode,
      booking,
      latestPayment,
    };
  }

  async history(user: JwtUser, bookingId: string) {
    await this.bookingsService.findOneForUser(bookingId, user);
    return this.paymentModel
      .find({ booking: new Types.ObjectId(bookingId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async completeStripeSession(sessionId: string) {
    const stripe = this.getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      throw new BadRequestException('Stripe session is not paid');
    }
    return this.completeTransaction(session.client_reference_id ?? '', 'stripe', session.id);
  }

  async handleStripeWebhook(rawBody: Buffer, signature?: string) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret || !signature) throw new BadRequestException('Stripe webhook is not configured');

    const event = this.getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      if (session.payment_status === 'paid') {
        await this.completeTransaction(session.client_reference_id ?? '', 'stripe', session.id);
      }
    }
    return { received: true };
  }

  async handleVnpayReturn(query: Record<string, string>) {
    if (!this.verifyVnpaySignature(query)) throw new BadRequestException('Invalid VNPay signature');
    const responseCode = query.vnp_ResponseCode;
    if (responseCode === '00') {
      return this.completeTransaction(query.vnp_TxnRef, 'vnpay', query.vnp_TransactionNo);
    }
    return this.failTransaction(query.vnp_TxnRef, 'vnpay', `VNPay failed with code ${responseCode}`);
  }

  async handleMomoIpn(body: Record<string, string | number>) {
    if (!this.verifyMomoSignature(body)) throw new BadRequestException('Invalid MoMo signature');
    const orderId = String(body.orderId ?? '');
    const resultCode = Number(body.resultCode);
    if (resultCode === 0) {
      return this.completeTransaction(orderId, 'momo', String(body.transId ?? ''));
    }
    return this.failTransaction(orderId, 'momo', `MoMo failed with code ${resultCode}`);
  }

  private async createGatewayCheckout(input: {
    provider: Exclude<PaymentProvider, 'mock'>;
    method: PaymentMethod;
    bookingId: string;
    userId: string;
    originalAmount: number;
    discount: CalculatedDiscount;
    paidAmount: number;
    eventTitle: string;
  }) {
    const transaction = await this.createTransaction({
      bookingId: input.bookingId,
      userId: input.userId,
      method: input.method,
      provider: input.provider,
      status: 'pending',
      originalAmount: input.originalAmount,
      discountAmount: input.discount.amount,
      discountCode: input.discount.code,
      paidAmount: input.paidAmount,
      message: `${input.provider} checkout created`,
    });

    const paymentUrl =
      input.provider === 'stripe'
        ? await this.createStripeCheckout(input, transaction.transactionCode)
        : input.provider === 'vnpay'
          ? this.createVnpayUrl(input, transaction.transactionCode)
          : await this.createMomoCheckout(input, transaction.transactionCode);

    transaction.paymentUrl = paymentUrl;
    await transaction.save();

    return {
      bookingId: input.bookingId,
      method: input.method,
      provider: input.provider,
      status: 'pending',
      paymentUrl,
      receipt: {
        transactionCode: transaction.transactionCode,
        originalAmount: input.originalAmount,
        discountAmount: input.discount.amount,
        discountCode: input.discount.code,
        paidAmount: input.paidAmount,
        emailStatus: 'mock_sent',
      },
    };
  }

  private async createStripeCheckout(
    input: { bookingId: string; paidAmount: number; eventTitle: string },
    transactionCode: string,
  ) {
    const session = await this.getStripe().checkout.sessions.create({
      mode: 'payment',
      client_reference_id: transactionCode,
      success_url: `${this.backendUrl}/payments/stripe/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.frontendUrl}/payments/${input.bookingId}?cancelled=1`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'vnd',
            product_data: { name: input.eventTitle },
            unit_amount: input.paidAmount,
          },
        },
      ],
      metadata: {
        bookingId: input.bookingId,
        transactionCode,
      },
    });
    if (!session.url) throw new BadRequestException('Stripe did not return checkout URL');
    return session.url;
  }

  private createVnpayUrl(
    input: { paidAmount: number; eventTitle: string },
    transactionCode: string,
  ) {
    const tmnCode = this.requiredEnv('VNPAY_TMN_CODE');
    const secret = this.requiredEnv('VNPAY_HASH_SECRET');
    const baseUrl = this.config.get<string>('VNPAY_PAYMENT_URL') ?? 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const now = new Date();
    const createDate = this.formatVnpayDate(now);
    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: String(input.paidAmount * 100),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: transactionCode,
      vnp_OrderInfo: input.eventTitle,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: `${this.backendUrl}/payments/vnpay/return`,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };
    const signed = this.signVnpayParams(params, secret);
    return `${baseUrl}?${new URLSearchParams(signed).toString()}`;
  }

  private async createMomoCheckout(
    input: { bookingId: string; paidAmount: number; eventTitle: string },
    transactionCode: string,
  ) {
    const endpoint = this.config.get<string>('MOMO_ENDPOINT') ?? 'https://test-payment.momo.vn/v2/gateway/api/create';
    const partnerCode = this.requiredEnv('MOMO_PARTNER_CODE');
    const accessKey = this.requiredEnv('MOMO_ACCESS_KEY');
    const secretKey = this.requiredEnv('MOMO_SECRET_KEY');
    const requestId = transactionCode;
    const orderId = transactionCode;
    const redirectUrl = `${this.backendUrl}/payments/momo/return`;
    const ipnUrl = `${this.backendUrl}/payments/momo/ipn`;
    const extraData = Buffer.from(JSON.stringify({ bookingId: input.bookingId })).toString('base64');
    const requestType = 'captureWallet';
    const rawSignature = `accessKey=${accessKey}&amount=${input.paidAmount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${input.eventTitle}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = createHmac('sha256', secretKey).update(rawSignature).digest('hex');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerCode,
        accessKey,
        requestId,
        amount: input.paidAmount,
        orderId,
        orderInfo: input.eventTitle,
        redirectUrl,
        ipnUrl,
        extraData,
        requestType,
        signature,
        lang: 'vi',
      }),
    });
    const data = (await response.json()) as { payUrl?: string; message?: string };
    if (!data.payUrl) throw new BadRequestException(data.message ?? 'MoMo did not return payUrl');
    return data.payUrl;
  }

  private async completeTransaction(transactionCode: string, provider: PaymentProvider, gatewayTransactionId?: string) {
    const transaction = await this.paymentModel.findOne({ transactionCode, provider }).exec();
    if (!transaction) throw new BadRequestException('Payment transaction not found');
    if (transaction.status === 'success') return transaction;

    const systemUser: JwtUser = { sub: transaction.user.toString(), email: '', role: 'admin' };
    const booking = await this.bookingsService.pay(transaction.booking.toString(), systemUser, {
      totalPrice: transaction.paidAmount,
      discountAmount: transaction.discountAmount,
      discountCode: transaction.discountCode,
    });
    transaction.status = 'success';
    transaction.gatewayTransactionId = gatewayTransactionId;
    transaction.message = `${provider} payment completed`;
    transaction.paidAt = new Date();
    await transaction.save();
    return { transaction, booking };
  }

  private async failTransaction(transactionCode: string, provider: PaymentProvider, message: string) {
    const transaction = await this.paymentModel.findOne({ transactionCode, provider }).exec();
    if (!transaction) throw new BadRequestException('Payment transaction not found');
    transaction.status = 'failed';
    transaction.message = message;
    await transaction.save();
    return transaction;
  }

  private buildCheckoutResponse(booking: any, method: PaymentMethod, provider: PaymentProvider, transaction: any) {
    return {
      bookingId: booking._id,
      method,
      provider,
      status: booking.status,
      qrCode: booking.qrCode,
      booking,
      receipt: {
        transactionCode: transaction.transactionCode,
        originalAmount: transaction.originalAmount,
        discountAmount: transaction.discountAmount,
        discountCode: transaction.discountCode,
        paidAmount: transaction.paidAmount,
        emailStatus: 'mock_sent',
      },
    };
  }

  private calculateDiscount(totalPrice: number, code?: string): CalculatedDiscount {
    const normalized = code?.trim().toUpperCase();
    if (!normalized) return { code: undefined, amount: 0 };
    if (normalized === 'EVENT10') return { code: normalized, amount: Math.round(totalPrice * 0.1) };
    if (normalized === 'VIP50') return { code: normalized, amount: Math.min(50000, totalPrice) };
    if (normalized === 'STUDENT20') return { code: normalized, amount: Math.round(totalPrice * 0.2) };
    throw new BadRequestException('Discount code is invalid');
  }

  private createTransaction(input: {
    bookingId: string;
    userId: string;
    method: PaymentMethod;
    provider: PaymentProvider;
    status: PaymentTransactionStatus;
    originalAmount: number;
    discountAmount: number;
    discountCode?: string;
    paidAmount: number;
    message: string;
    paidAt?: Date;
  }) {
    return this.paymentModel.create({
      booking: new Types.ObjectId(input.bookingId),
      user: new Types.ObjectId(input.userId),
      method: input.method,
      provider: input.provider,
      status: input.status,
      originalAmount: input.originalAmount,
      discountAmount: input.discountAmount,
      discountCode: input.discountCode,
      paidAmount: input.paidAmount,
      message: input.message,
      paidAt: input.paidAt,
      transactionCode: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    });
  }

  private getStripe() {
    return new Stripe(this.requiredEnv('STRIPE_SECRET_KEY'));
  }

  private requiredEnv(key: string) {
    const value = this.config.get<string>(key);
    if (!value) throw new BadRequestException(`${key} is not configured`);
    return value;
  }

  private formatVnpayDate(date: Date) {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }

  private signVnpayParams(params: Record<string, string>, secret: string) {
    const sorted = Object.keys(params)
      .sort()
      .reduce<Record<string, string>>((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    const signData = new URLSearchParams(sorted).toString();
    return {
      ...sorted,
      vnp_SecureHash: createHmac('sha512', secret).update(Buffer.from(signData, 'utf-8')).digest('hex'),
    };
  }

  private verifyVnpaySignature(query: Record<string, string>) {
    const secret = this.requiredEnv('VNPAY_HASH_SECRET');
    const secureHash = query.vnp_SecureHash;
    const params = { ...query };
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;
    const expected = this.signVnpayParams(params, secret).vnp_SecureHash;
    return secureHash === expected;
  }

  private verifyMomoSignature(body: Record<string, string | number>) {
    const secretKey = this.requiredEnv('MOMO_SECRET_KEY');
    const keys = [
      'accessKey',
      'amount',
      'extraData',
      'message',
      'orderId',
      'orderInfo',
      'orderType',
      'partnerCode',
      'payType',
      'requestId',
      'responseTime',
      'resultCode',
      'transId',
    ];
    const rawSignature = keys
      .filter((key) => body[key] !== undefined)
      .map((key) => `${key}=${body[key]}`)
      .join('&');
    const expected = createHmac('sha256', secretKey).update(rawSignature).digest('hex');
    return body.signature === expected;
  }
}
