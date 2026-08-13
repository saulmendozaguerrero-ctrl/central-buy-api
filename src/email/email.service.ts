import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

export interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
  plainText?: string;
  from?: string;
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly replyToEmail: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('SENDGRID_API_KEY') || '';
    this.fromEmail = this.config.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@central-buy.es';
    this.replyToEmail = this.config.get<string>('SENDGRID_REPLY_TO_EMAIL') || 'soporte@central-buy.es';

    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    } else {
      this.logger.warn('[EMAIL] SENDGRID_API_KEY is not set. Emails will not be sent.');
    }
  }

  /**
   * Send a single email
   */
  async send(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.apiKey) {
      this.logger.warn(`[EMAIL] Skipping email to ${payload.to} (SendGrid not configured)`);
      return { success: false, error: 'SendGrid not configured' };
    }

    try {
      const message = {
        to: payload.to,
        from: payload.from || this.fromEmail,
        subject: payload.subject,
        html: payload.htmlContent,
        text: payload.plainText || payload.subject,
        replyTo: payload.replyTo || this.replyToEmail,
      };

      const response = await sgMail.send(message);

      this.logger.log(
        `✅ [EMAIL SENT] to=${payload.to} | subject="${payload.subject}" | messageId=${response[0].headers['x-message-id']}`,
      );

      return {
        success: true,
        messageId: response[0].headers['x-message-id'] as string,
      };
    } catch (error) {
      this.logger.error(`❌ [EMAIL ERROR] to=${payload.to} | error=${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send payment confirmation email (most common use case)
   */
  async sendPaymentConfirmation(
    userEmail: string,
    userName: string,
    amount: number,
    plan: string,
    orderId: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const htmlContent = this.buildPaymentConfirmationEmail(userName, amount, plan, orderId);

    return this.send({
      to: userEmail,
      subject: `✅ Pago procesado en CENTRAL BUY — €${(amount / 100).toFixed(2)}`,
      htmlContent,
      plainText: `Tu pago de €${(amount / 100).toFixed(2)} ha sido procesado exitosamente. Plan: ${plan}. ID: ${orderId}`,
    });
  }

  /**
   * Send trial expiration reminder
   */
  async sendTrialExpiringReminder(userEmail: string, userName: string, daysLeft: number) {
    const htmlContent = this.buildTrialExpiringEmail(userName, daysLeft);

    return this.send({
      to: userEmail,
      subject: `⏰ Tu prueba gratuita vence en ${daysLeft} días`,
      htmlContent,
      plainText: `Tu prueba gratuita de CENTRAL BUY vence en ${daysLeft} días.`,
    });
  }

  /**
   * Send subscription cancellation email
   */
  async sendSubscriptionCancelled(userEmail: string, userName: string) {
    const htmlContent = this.buildSubscriptionCancelledEmail(userName);

    return this.send({
      to: userEmail,
      subject: `Suscripción cancelada en CENTRAL BUY`,
      htmlContent,
      plainText: `Tu suscripción en CENTRAL BUY ha sido cancelada.`,
    });
  }

  /**
   * Build payment confirmation HTML
   */
  private buildPaymentConfirmationEmail(userName: string, amount: number, plan: string, orderId: string): string {
    const planName = plan === 'PERSONAL' ? 'Plan Particular' : 'Plan Empresa';
    const dashboardUrl = 'https://central-buy-app.vercel.app/dashboard';

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            padding: 40px 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .status {
            font-size: 14px;
            color: #059669;
            font-weight: 600;
          }
          h1 {
            font-size: 28px;
            color: #111827;
            margin: 20px 0;
          }
          .content {
            margin: 30px 0;
          }
          .details {
            background-color: #f3f4f6;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            color: #6b7280;
            font-weight: 500;
          }
          .detail-value {
            color: #111827;
            font-weight: 600;
          }
          .amount {
            font-size: 32px;
            color: #2563eb;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .cta-container {
            text-align: center;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
          .footer-links {
            margin-top: 10px;
          }
          .footer-links a {
            color: #2563eb;
            text-decoration: none;
            margin: 0 10px;
          }
          .footer-links a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CENTRAL BUY</div>
            <div class="status">✅ Pago procesado</div>
          </div>

          <h1>¡Compra completada!</h1>

          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            <p>Tu pago ha sido procesado exitosamente. Acceso a tu plan activado inmediatamente.</p>

            <div class="amount">€${(amount / 100).toFixed(2)}</div>

            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Plan:</span>
                <span class="detail-value">${planName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duración:</span>
                <span class="detail-value">1 mes</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Próxima renovación:</span>
                <span class="detail-value">${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ID pedido:</span>
                <span class="detail-value">#${orderId}</span>
              </div>
            </div>

            <div class="cta-container">
              <a href="${dashboardUrl}" class="cta-button">Ir a tu Dashboard</a>
            </div>

            <p>Tu plan incluye:</p>
            <ul>
              <li>✅ Precios de 4 mercados internacionales</li>
              <li>✅ Calculadora de ahorro en tiempo real</li>
              <li>✅ Alertas de precio y reportes</li>
              <li>✅ Soporte 24h (${planName === 'Plan Empresa' ? '5' : '2'} asesorías/mes)</li>
            </ul>
          </div>

          <div class="footer">
            <p>Este es un email automático de CENTRAL BUY. No respondas a este correo.</p>
            <div class="footer-links">
              <a href="https://central-buy.es/privacy">Política de Privacidad</a>
              <a href="https://central-buy.es/terms">Términos de Servicio</a>
              <a href="https://central-buy-app.vercel.app/unsubscribe">Desuscribirse</a>
            </div>
            <p>CENTRAL BUY, Ciempozuelos, España</p>
            <p style="color: #d1d5db; font-size: 11px;">
              © 2026 CENTRAL BUY by SPFO Group. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Build trial expiring reminder HTML
   */
  private buildTrialExpiringEmail(userName: string, daysLeft: number): string {
    return `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <h2>⏰ Tu prueba gratuita vence en ${daysLeft} días</h2>
        <p>Hola ${userName},</p>
        <p>Tu acceso gratuito a CENTRAL BUY vence el ${new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}.</p>
        <p>Para seguir disfrutando de:</p>
        <ul>
          <li>Precios de mercados internacionales</li>
          <li>Alertas de precio en tiempo real</li>
          <li>Reportes de ahorro</li>
        </ul>
        <p>
          <a href="https://central-buy-app.vercel.app/select-plan" 
             style="background: #2563eb; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Elige tu plan (desde €4,99/mes)
          </a>
        </p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          Este es un email automático. No respondas a este correo.
          <a href="https://central-buy-app.vercel.app/unsubscribe?email=${userName}">Desuscribirse</a>
        </p>
      </div>
    `;
  }

  /**
   * Build subscription cancelled HTML
   */
  private buildSubscriptionCancelledEmail(userName: string): string {
    return `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <h2>Suscripción cancelada</h2>
        <p>Hola ${userName},</p>
        <p>Tu suscripción a CENTRAL BUY ha sido cancelada.</p>
        <p>Lamentaremos verte partir. Si hay algo que podamos mejorar, escríbenos: soporte@central-buy.es</p>
        <p>Siempre serás bienvenido de vuelta.</p>
        <p>— El equipo de CENTRAL BUY</p>
      </div>
    `;
  }
}
