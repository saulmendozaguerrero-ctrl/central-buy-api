import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendConsultationConfirmation(email: string, name: string, consultationType: string): Promise<boolean> {
    try {
      const message = `
📧 CONSULTATION REQUEST CONFIRMATION

To: ${email}
Name: ${name}
Type: ${consultationType}
Timestamp: ${new Date().toISOString()}

---
This is a test confirmation. In production, this will be sent via Resend.
---
      `;

      this.logger.log(`[EMAIL SENT] ${message}`);

      // TODO: Send real email via Resend if API_KEY is available
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_test_PLACEHOLDER') {
        // TODO: Call Resend API
        // const response = await fetch('https://api.resend.com/emails', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     from: 'noreply@centralbuy.com',
        //     to: email,
        //     subject: '✅ Consultation Request Received',
        //     html: `<p>Hi ${name},</p><p>We received your ${consultationType} request.</p><p>Our team will contact you within 24 hours.</p>`,
        //   }),
        // });
      }

      return true;
    } catch (error) {
      this.logger.error(`[EMAIL ERROR] ${error.message}`);
      return false; // Don't fail the whole request if email fails
    }
  }

  async sendConsultationAssignment(email: string, consultantName: string, scheduledAt: Date): Promise<boolean> {
    try {
      const message = `
📧 CONSULTATION SCHEDULED

Consultant: ${consultantName}
Scheduled At: ${scheduledAt.toISOString()}
Email: ${email}

---
Confirmation email in test mode
---
      `;

      this.logger.log(`[EMAIL SENT] ${message}`);
      return true;
    } catch (error) {
      this.logger.error(`[EMAIL ERROR] ${error.message}`);
      return false;
    }
  }

  async sendAdminAlert(adminEmail: string, consultationType: string, userName: string): Promise<boolean> {
    try {
      const message = `
📧 ADMIN ALERT: New Consultation Request

Type: ${consultationType}
From: ${userName}
Admin: ${adminEmail}
Timestamp: ${new Date().toISOString()}

---
Admin notification in test mode
---
      `;

      this.logger.log(`[ADMIN EMAIL] ${message}`);
      return true;
    } catch (error) {
      this.logger.error(`[EMAIL ERROR] ${error.message}`);
      return false;
    }
  }
}
