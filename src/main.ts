import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 3000;
  const corsOrigins = configService.get<string[]>('app.corsOrigins') ?? ['http://localhost:3001'];

  // ─── CORS ────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  });

  // ─── Global Prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api', { exclude: ['health', ''] });

  // ─── Validation ──────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Global Filters & Interceptors ───────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ─── Swagger ─────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Central Buy API')
    .setDescription(
      'Backend API for Central Buy — fuel intelligence SaaS platform by SPFO Group',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Health')
    .addTag('Auth')
    .addTag('Subscriptions')
    .addTag('Prices')
    .addTag('Configurator')
    .addTag('Consultations')
    .addTag('Fleet')
    .addTag('Organizations')
    .addTag('Academy')
    .addTag('Marketplace')
    .addTag('Admin')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });
app.get('/api/seed', async (req, res) => {
  try {
    const prices = [
      { product: 'Diesel', region: 'Europe', priceEur: 1171.50, priceUsd: 1285.00 },
      { product: 'Gasoline', region: 'Europe', priceEur: 987.30, priceUsd: 1082.50 },
      { product: 'Jet Fuel', region: 'Europe', priceEur: 1043.20, priceUsd: 1144.00 },
      { product: 'LNG', region: 'Global', priceEur: 19.86, priceUsd: 21.75 },
      { product: 'Brent Crude', region: 'Global', priceEur: 752.40, priceUsd: 825.00 },
    ];
    
    for (const p of prices) {
      await dataSource.query(
        'INSERT INTO prices (product, region, price_eur, price_usd, source, timestamp) VALUES ($1, $2, $3, $4, $5, NOW())',
        [p.product, p.region, p.priceEur, p.priceUsd, 'Platts']
      );
    }
    
    res.json({ message: 'Seeded', count: prices.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Central Buy API running on http://localhost:${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
  logger.log(`Environment: ${configService.get<string>('app.nodeEnv')}`);
}

bootstrap();
