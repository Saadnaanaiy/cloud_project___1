import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const smtpKey = this.config.get<string>('BREVO_SMTP_KEY');
    const fromEmail = this.config.get<string>('BREVO_FROM_EMAIL');

    if (smtpKey && fromEmail) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: { user: fromEmail, pass: smtpKey },
      });
    } else {
      this.logger.warn(
        'BREVO_SMTP_KEY / BREVO_FROM_EMAIL not set — emails disabled',
      );
    }
  }

  private async sendMail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.warn(`Email not sent (unconfigured): ${subject} -> ${to}`);
      return;
    }
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('BREVO_FROM_EMAIL'),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${subject} -> ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err}`);
    }
  }

  async sendLeaveStatusEmail(
    to: string,
    employeeName: string,
    type: string,
    status: string,
    comment?: string,
  ) {
    const statusLabel = status === 'approved' ? 'Approved' : 'Rejected';
    const subject = `Leave Request ${statusLabel}`;
    const html = `
      <h2>Leave Request ${statusLabel}</h2>
      <p>Dear ${employeeName},</p>
      <p>Your <strong>${type}</strong> leave request has been <strong>${statusLabel}</strong>.</p>
      ${comment ? `<p>Comment: ${comment}</p>` : ''}
      <p>Thank you.</p>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendAnnouncementEmail(
    to: string,
    title: string,
    content: string,
  ) {
    const subject = `New Announcement: ${title}`;
    const html = `
      <h2>${title}</h2>
      <p>${content}</p>
    `;
    return this.sendMail(to, subject, html);
  }
}
