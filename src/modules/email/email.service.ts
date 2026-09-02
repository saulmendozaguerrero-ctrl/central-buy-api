import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private sendgridApiKey: string;
  private fromEmail: string;
  private replyToEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY') || '';
    this.fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@central-buy.es';
    this.replyToEmail = this.configService.get<string>('SENDGRID_REPLY_TO_EMAIL') || 'soporte@central-buy.es';

    if (this.sendgridApiKey && this.sendgridApiKey !== 'SG.YOUR_API_KEY_HERE') {
      sgMail.setApiKey(this.sendgridApiKey);
    }
  }

  /**
   * Send welcome email after onboarding
   */
  async sendWelcomeEmail(
    email: string,
    name: string,
    plan: string,
  ): Promise<SendEmailResult> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">¡Bienvenido a CENTRAL BUY! 🎉</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <p>Hola <strong>${name}</strong>,</p>
            <p>Tu cuenta ha sido activada con éxito. Gracias por elegir CENTRAL BUY como tu plataforma de compras inteligentes.</p>
            <p><strong>Tu plan:</strong> <span style="color: #2563eb; font-weight: bold;">${plan.toUpperCase()}</span></p>
            <p>Ahora puedes:</p>
            <ul>
              <li>Buscar productos y proveedores en tiempo real</li>
              <li>Comparar precios automáticamente</li>
              <li>Obtener reportes de ahorro personalizado</li>
              <li>Acceder a análisis de mercado exclusivos</li>
            </ul>
            <p><a href="https://centralbuyapp.spfo.es/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Ir al dashboard</a></p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
            <p>¿Preguntas? Contacta a nuestro equipo: <a href="mailto:${this.replyToEmail}">${this.replyToEmail}</a></p>
            <p style="color: #666; font-size: 12px;">&copy; 2024 CENTRAL BUY. Todos los derechos reservados.</p>
          </div>
        </div>
      `;

      return this.send({
        to: email,
        subject: `✅ ¡Bienvenido ${name}! Tu cuenta en CENTRAL BUY está lista`,
        htmlContent,
        plainText: `Hola ${name}, tu cuenta en CENTRAL BUY está activada. Plan: ${plan}. Ir a: https://centralbuyapp.spfo.es/dashboard`,
      });
    } catch (error) {
      this.logger.error(`[EMAIL ERROR] sendWelcomeEmail: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(
    email: string,
    name: string,
    amount: number,
    plan: string,
    transactionId: string,
  ): Promise<SendEmailResult> {
    try {
      const amountEur = (amount / 100).toFixed(2);
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Pago procesado correctamente</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <p>Hola <strong>${name}</strong>,</p>
            <p>Tu pago ha sido procesado con éxito. Aquí están los detalles de tu transacción:</p>
            <div style="background: white; border: 1px solid #ddd; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Monto:</strong> €${amountEur}</p>
              <p style="margin: 5px 0;"><strong>Plan:</strong> ${plan.toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>ID Transacción:</strong> ${transactionId}</p>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            </div>
            <p>Tu suscripción ya está activa. Accede a todas las funciones premium de CENTRAL BUY.</p>
            <p><a href="https://centralbuyapp.spfo.es/dashboard" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Ir a tu cuenta</a></p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
            <p style="color: #666; font-size: 12px;">Si tienes problemas, contacta a soporte: <a href="mailto:${this.replyToEmail}">${this.replyToEmail}</a></p>
          </div>
        </div>
      `;

      return this.send({
        to: email,
        subject: `✅ Pago confirmado — €${amountEur} | Plan ${plan}`,
        htmlContent,
        plainText: `Tu pago de €${amountEur} ha sido procesado. Transacción: ${transactionId}. Plan: ${plan}`,
      });
    } catch (error) {
      this.logger.error(`[EMAIL ERROR] sendPaymentConfirmation: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send subscription cancellation email
   */
  async sendSubscriptionCancelled(
    email: string,
    name: string,
  ): Promise<SendEmailResult> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Suscripción cancelada</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <p>Hola <strong>${name}</strong>,</p>
            <p>Tu suscripción a CENTRAL BUY ha sido cancelada. Acceso a funciones premium terminado.</p>
            <p>Lamentamos verte partir. Si hay algo que podamos mejorar, contacta a nuestro equipo:</p>
            <p><a href="mailto:${this.replyToEmail}" style="color: #2563eb; text-decoration: none;">${this.replyToEmail}</a></p>
            <p>Siempre puedes reactivar tu suscripción en cualquier momento accediendo a tu cuenta.</p>
            <p><a href="https://centralbuyapp.spfo.es/pricing" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Ver planes</a></p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
            <p style="color: #666; font-size: 12px;">&copy; 2024 CENTRAL BUY. Todos los derechos reservados.</p>
          </div>
        </div>
      `;

      return this.send({
        to: email,
        subject: `Suscripción cancelada — CENTRAL BUY`,
        htmlContent,
        plainText: `Tu suscripción a CENTRAL BUY ha sido cancelada. Si deseas reactivarla, accede a tu cuenta.`,
      });
    } catch (error) {
      this.logger.error(`[EMAIL ERROR] sendSubscriptionCancelled: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generic send email method using SendGrid
   */
  async send({
    to,
    subject,
    htmlContent,
    plainText,
  }: {
    to: string;
    subject: string;
    htmlContent: string;
    plainText: string;
  }): Promise<SendEmailResult> {
    try {
      // If no SendGrid API key, log to console in development
      if (!this.sendgridApiKey || this.sendgridApiKey === 'SG.YOUR_API_KEY_HERE') {
        this.logger.warn(
          `[EMAIL TEST MODE] ${to} | Subject: ${subject}\n${plainText}`,
        );
        return {
          success: true,
          messageId: `test-${Date.now()}`,
        };
      }

      // Send via SendGrid
      const msg = {
        to,
        from: this.fromEmail,
        replyTo: this.replyToEmail,
        subject,
        html: htmlContent,
        text: plainText,
      };

      const response = await sgMail.send(msg as any);
      const messageId = response[0].headers['x-message-id'] || `sg-${Date.now()}`;

      this.logger.log(`[EMAIL SENT] ${to} | messageId=${messageId}`);

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      this.logger.error(`[EMAIL ERROR] ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Legacy methods for backward compatibility
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

  async sendConsultationAssignment(
    email: string,
    consultantName: string,
    scheduledAt: Date,
  ): Promise<boolean> {
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

  async sendAdminAlert(
    adminEmail: string,
    consultationType: string,
    userName: string,
  ): Promise<boolean> {
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
