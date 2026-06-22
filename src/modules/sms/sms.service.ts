import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Twilio type stub (will work even without real library installed in test mode)
interface TwilioClient {
  messages: {
    create: (config: any) => Promise<{ sid: string }>;
  };
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly twilioClient: TwilioClient | null;
  private readonly twilioFrom: string;

  constructor(private readonly config: ConfigService) {
    // Initialize Twilio if credentials available
    const accountSid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.config.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioFrom = this.config.get<string>('TWILIO_FROM_NUMBER') || '+1234567890';

    if (accountSid && authToken && authToken !== 'test_PLACEHOLDER') {
      try {
        // TODO: Uncomment when twilio package installed
        // const twilio = require('twilio');
        // this.twilioClient = twilio(accountSid, authToken);
        this.twilioClient = null;
      } catch (e) {
        this.logger.warn('[SMS] Twilio library not installed. Running in mock mode.');
        this.twilioClient = null;
      }
    } else {
      this.twilioClient = null;
    }
  }

  async sendConsultationConfirmation(phone: string, name: string): Promise<boolean> {
    if (!phone || phone.length < 10) {
      this.logger.warn(`[SMS] Invalid phone number: ${phone}`);
      return false;
    }

    const message = `¡Hola ${name}! Hemos recibido tu solicitud de asesoramiento. Nos pondremos en contacto en 24 horas. CENTRAL BUY`;

    try {
      if (this.twilioClient) {
        // TODO: Uncomment when Twilio is configured
        // const result = await this.twilioClient.messages.create({
        //   body: message,
        //   from: this.twilioFrom,
        //   to: phone,
        // });
        // this.logger.log(`[SMS SENT] ${result.sid} to ${phone}`);
        // return true;
      } else {
        // Mock mode: log to console
        this.logger.log(`[SMS MOCK] To: ${phone} | Message: ${message}`);
        return true;
      }
    } catch (error) {
      this.logger.error(`[SMS ERROR] Failed to send: ${error.message}`);
      return false; // Don't fail entire request if SMS fails
    }
    return false; // Fallback
  }

  async sendAdminAlert(phone: string, userName: string, consultationType: string): Promise<boolean> {
    if (!phone) return false;

    const message = `⚠️ Nueva solicitud de asesoramiento: ${userName} (${consultationType}). Revisa el dashboard.`;

    try {
      if (this.twilioClient) {
        // Real Twilio send
        // await this.twilioClient.messages.create({ ... });
      } else {
        this.logger.log(`[SMS MOCK - ADMIN] To: ${phone} | ${message}`);
      }
      return true;
    } catch (error) {
      this.logger.error(`[SMS ERROR] ${error.message}`);
      return false;
    }
    return false;
  }

  async sendSubscriptionConfirmation(phone: string, plan: string): Promise<boolean> {
    if (!phone) return false;

    const planName = plan === 'particular' ? 'Particular (€4,99/mes)' : 'Empresa (€9,99/mes)';
    const message = `✅ Suscripción confirmada: ${planName}. Accede a tu dashboard en https://central-buy-app.vercel.app`;

    try {
      if (this.twilioClient) {
        // Real send
      } else {
        this.logger.log(`[SMS MOCK - SUBSCRIPTION] To: ${phone} | ${message}`);
      }
      return true;
    } catch (error) {
      this.logger.error(`[SMS ERROR] ${error.message}`);
      return false;
    }
    return false;
  }
}
