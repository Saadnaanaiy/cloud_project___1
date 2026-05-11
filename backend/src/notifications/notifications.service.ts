import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT', 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const fromEmail = this.config.get<string>('SMTP_FROM_EMAIL');

    if (host && user && pass && fromEmail) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      this.logger.warn(
        'SMTP_HOST / SMTP_USER / SMTP_PASS / SMTP_FROM_EMAIL not set — emails disabled',
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
        from: this.config.get<string>('SMTP_FROM_EMAIL'),
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

  async sendNewLeaveNotification(
    to: string,
    employeeName: string,
    type: string,
  ) {
    const subject = `New Leave Request: ${type}`;
    const html = `
      <h2>New Leave Request</h2>
      <p><strong>${employeeName}</strong> has submitted a <strong>${type}</strong> leave request.</p>
      <p>Please review and approve/reject it in the system.</p>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendAnnouncementEmail(to: string, title: string, content: string) {
    const subject = `New Announcement: ${title}`;
    const html = `
      <h2>${title}</h2>
      <p>${content}</p>
    `;
    return this.sendMail(to, subject, html);
  }
}
