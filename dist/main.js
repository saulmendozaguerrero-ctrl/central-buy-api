"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
        logger: ['error', 'warn', 'log', 'debug'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('app.port') ?? 3000;
    const corsOrigins = configService.get('app.corsOrigins') ?? ['http://localhost:3001'];
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
    });
    app.setGlobalPrefix('api', { exclude: ['health', ''] });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Central Buy API')
        .setDescription('Backend API for Central Buy — fuel intelligence SaaS platform by SPFO Group')
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
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
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
                await dataSource.query('INSERT INTO prices (product, region, price_eur, price_usd, source, timestamp) VALUES ($1, $2, $3, $4, $5, NOW())', [p.product, p.region, p.priceEur, p.priceUsd, 'Platts']);
            }
            res.json({ message: 'Seeded', count: prices.length });
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    await app.listen(port);
    const logger = new common_1.Logger('Bootstrap');
    logger.log(`Central Buy API running on http://localhost:${port}`);
    logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
    logger.log(`Environment: ${configService.get('app.nodeEnv')}`);
}
bootstrap();
//# sourceMappingURL=main.js.map