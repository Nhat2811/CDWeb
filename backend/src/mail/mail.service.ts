import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`SMTP configured for ${host}:${port}`);
    } else {
      this.logger.warn('SMTP configuration is missing. Emails will only be logged.');
    }
  }

  async sendTicketEmail(to: string, booking: any) {
    const eventTitle = booking.event?.title ?? 'Event';
    const subject = `Your Tickets for ${eventTitle}`;
    
    // Create a data URL from the QR code (if it's base64 or a link)
    // Actually booking.qrCode is already a base64 data URI string because the booking service generates it using qrcode.toDataURL()
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #1e293b; line-height: 1.5; padding: 20px; background-color: #f8fafc;">
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #0f172a;">Chi tiết vé</h1>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Booking #${booking._id?.toString().slice(-8).toUpperCase() || 'UNKNOWN'}</p>
        </div>
        
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0; border-collapse: collapse;">
            <tr>
              <td width="30%" valign="top" style="padding: 24px; border-right: 1px solid #e2e8f0; text-align: center; background: #fafafa;">
                <img src="cid:qrcode" alt="QR Code" style="width: 100%; max-width: 200px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; background: white; padding: 8px;" />
                <p style="color: #0f9f8e; font-size: 13px; font-weight: 700; margin: 0;">Đã thanh toán</p>
              </td>
              <td width="70%" valign="top" style="padding: 24px;">
                <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 4px; color: #0f172a;">${eventTitle}</h2>
                <p style="color: #64748b; font-size: 13px; margin: 0 0 24px;">
                  ${booking.event?.startDate ? new Date(booking.event.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(booking.event.startDate).toLocaleDateString('vi-VN') : ''} · ${booking.event?.location || 'Chưa cập nhật'}
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                  <tr>
                    <td width="50%" valign="top" style="padding-bottom: 16px;">
                      <p style="font-size: 12px; color: #64748b; margin: 0 0 4px; font-weight: 600;">NGƯỜI ĐẶT</p>
                      <p style="margin: 0; font-weight: 600;">${booking.user?.name || 'Customer'}</p>
                    </td>
                    <td width="50%" valign="top" style="padding-bottom: 16px;">
                      <p style="font-size: 12px; color: #64748b; margin: 0 0 4px; font-weight: 600;">EMAIL</p>
                      <p style="margin: 0; font-weight: 600;">${booking.user?.email || to}</p>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" valign="top" style="padding-bottom: 16px;">
                      <p style="font-size: 12px; color: #64748b; margin: 0 0 4px; font-weight: 600;">SĐT</p>
                      <p style="margin: 0; font-weight: 600;">${booking.user?.phone || 'Chưa cập nhật'}</p>
                    </td>
                    <td width="50%" valign="top" style="padding-bottom: 16px;">
                      <p style="font-size: 12px; color: #64748b; margin: 0 0 4px; font-weight: 600;">LOẠI VÉ</p>
                      <p style="margin: 0; font-weight: 600;">${booking.ticket?.name || 'Vé'}</p>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" valign="top" style="padding-bottom: 16px;">
                      <p style="font-size: 12px; color: #64748b; margin: 0 0 4px; font-weight: 600;">SỐ LƯỢNG</p>
                      <p style="margin: 0; font-weight: 600;">${booking.quantity || 1}</p>
                    </td>
                    <td width="50%" valign="top" style="padding-bottom: 16px;">
                      <p style="font-size: 12px; color: #64748b; margin: 0 0 4px; font-weight: 600;">TỔNG TIỀN</p>
                      <p style="margin: 0; font-weight: 600;">${(booking.totalPrice || 0).toLocaleString('vi-VN')}đ</p>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" valign="top">
                      <p style="font-size: 12px; color: #64748b; margin: 0 0 4px; font-weight: 600;">THỜI GIAN THANH TOÁN</p>
                      <p style="margin: 0; font-weight: 600;">${new Date(booking.updatedAt || booking.createdAt || new Date()).toLocaleString('vi-VN')}</p>
                    </td>
                    <td width="50%" valign="top">
                      <p style="font-size: 12px; color: #64748b; margin: 0 0 4px; font-weight: 600;">TRẠNG THÁI</p>
                      <p style="margin: 0; font-weight: 600;">${booking.status || 'paid'}</p>
                    </td>
                  </tr>
                </table>

                <div style="margin-top: 24px; padding: 16px; background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px;">
                  <p style="margin: 0 0 8px; font-weight: 700; color: #0f172a; font-size: 14px;">Chính sách hoàn vé</p>
                  <p style="margin: 0; color: #64748b; font-size: 13px;">Vé chờ thanh toán có thể hủy trực tiếp. Vé đã thanh toán cần liên hệ ban tổ chức để được hỗ trợ theo chính sách từng sự kiện.</p>
                </div>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                  <tr>
                    <td align="left" style="color: #64748b; font-size: 13px;">Hỗ trợ qua email trong 24h</td>
                    <td align="right" style="color: #64748b; font-size: 13px;">Hotline tại cổng check-in</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;

    if (!this.transporter) {
      this.logger.debug(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Event Booking" <${this.config.get<string>('SMTP_USER')}>`,
        to,
        subject,
        html,
        attachments: [
          {
            filename: 'qrcode.png',
            path: booking.qrCode,
            cid: 'qrcode'
          }
        ]
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${(error as Error).message}`);
    }
  }

  async sendGenericEmail(to: string, subject: string, content: string, isHtml: boolean = false) {
    if (!this.transporter) {
      this.logger.debug(`[MOCK EMAIL] To: ${to}, Subject: ${subject}\nContent: ${content}`);
      return;
    }

    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"Event Booking" <${this.config.get<string>('SMTP_USER')}>`,
        to,
        subject,
      };

      if (isHtml) {
        mailOptions.html = content;
      } else {
        mailOptions.text = content;
      }

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Generic email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send generic email to ${to}: ${(error as Error).message}`);
    }
  }
}
