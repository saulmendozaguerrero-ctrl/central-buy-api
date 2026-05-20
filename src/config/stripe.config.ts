import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY ?? '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  priceParticular: process.env.STRIPE_PRICE_PARTICULAR ?? '',
  priceEmpresa: process.env.STRIPE_PRICE_EMPRESA ?? '',
}));
