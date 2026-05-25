# Central Buy API — Testing Endpoints

Este archivo documenta los endpoints críticos para testing manual del backend.

## 📋 Pre-requisitos

- Docker containers running (PostgreSQL + Redis)
- Backend running: `pnpm run start:dev` (puerto 3000)
- Seed data cargado (9 usuarios + datos de prueba)

---

## 🏥 Health Check

### GET /health
Verifica que el API está operativo.

```bash
curl -X GET http://localhost:3000/health
```

**Expected Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-05-25T15:30:00.000Z",
  "version": "1.0.0"
}
```

---

## 🔐 AUTH MODULE

### POST /auth/register
Registra un usuario nuevo.

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.local",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "user-xxx",
  "email": "newuser@test.local",
  "plan": "particular",
  "createdAt": "2026-05-25T15:30:00.000Z"
}
```

### POST /auth/login
Autentica usuario (requiere integración Clerk en prod, aquí simularemos con token mock).

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "particular@centralbuy.local",
    "password": "mock_password"
  }'
```

---

## 💳 SUBSCRIPTIONS MODULE

### GET /subscriptions
Obtiene suscripción del usuario autenticado.

```bash
# Con token Bearer (mock en desarrollo)
curl -X GET http://localhost:3000/subscriptions \
  -H "Authorization: Bearer mock_token_test_001"
```

**Expected Response (200 OK):**
```json
{
  "id": "sub-001",
  "userId": "user-test-001",
  "plan": "particular",
  "status": "active",
  "currentPeriodStart": "2026-05-25T00:00:00.000Z",
  "currentPeriodEnd": "2026-06-25T00:00:00.000Z"
}
```

### POST /subscriptions/checkout
Inicia checkout Stripe para nueva suscripción.

```bash
curl -X POST http://localhost:3000/subscriptions/checkout \
  -H "Authorization: Bearer mock_token_test_001" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "empresa",
    "successUrl": "http://localhost:3001/success",
    "cancelUrl": "http://localhost:3001/cancel"
  }'
```

**Expected Response (200 OK):**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

---

## 💰 PRICES MODULE

### GET /prices/latest
Obtiene últimos precios por producto y región.

```bash
curl -X GET http://localhost:3000/prices/latest \
  -H "Authorization: Bearer mock_token_test_001"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "price-001",
    "product": "diesel",
    "region": "rotterdam",
    "priceUsd": 1.171,
    "priceEur": 1.089,
    "priceDate": "2026-05-25T00:00:00.000Z"
  },
  {
    "id": "price-002",
    "product": "diesel",
    "region": "fujairah",
    "priceUsd": 1.165,
    "priceEur": 1.084,
    "priceDate": "2026-05-25T00:00:00.000Z"
  }
]
```

### GET /prices/best
Obtiene el mejor (más bajo) precio mundial por producto.

```bash
curl -X GET http://localhost:3000/prices/best \
  -H "Authorization: Bearer mock_token_test_001"
```

**Expected Response (200 OK):**
```json
{
  "diesel": {
    "id": "price-002",
    "product": "diesel",
    "region": "fujairah",
    "priceUsd": 1.165,
    "priceEur": 1.084
  },
  "gasoline": {
    "id": "price-006",
    "product": "gasoline",
    "region": "fujairah",
    "priceUsd": 1.082,
    "priceEur": 1.005
  },
  "propane": {
    "id": "price-008",
    "product": "propane",
    "region": "rotterdam",
    "priceUsd": 0.654,
    "priceEur": 0.607
  }
}
```

### GET /prices/product/:product
Obtiene precios para un producto específico.

```bash
curl -X GET http://localhost:3000/prices/product/diesel \
  -H "Authorization: Bearer mock_token_test_001"
```

### GET /prices/region/:region
Obtiene precios para una región específica.

```bash
curl -X GET http://localhost:3000/prices/region/spain \
  -H "Authorization: Bearer mock_token_test_001"
```

### GET /prices/history?product=diesel&from=2026-05-20&to=2026-05-25
Obtiene historial de precios con filtros.

```bash
curl -X GET "http://localhost:3000/prices/history?product=diesel&from=2026-05-20&to=2026-05-25" \
  -H "Authorization: Bearer mock_token_test_001"
```

### POST /prices/admin/upload
Upload manual de precios (ADMIN ONLY).

```bash
curl -X POST http://localhost:3000/prices/admin/upload \
  -H "Authorization: Bearer mock_token_admin_001" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "product": "diesel",
      "region": "spain",
      "priceUsd": 1.210,
      "priceEur": 1.123,
      "priceDate": "2026-05-25"
    },
    {
      "product": "gasoline",
      "region": "spain",
      "priceUsd": 1.120,
      "priceEur": 1.040,
      "priceDate": "2026-05-25"
    }
  ]'
```

---

## 🚗 FLEET MODULE

### GET /fleet/vehicles
Obtiene vehículos del usuario.

```bash
curl -X GET http://localhost:3000/fleet/vehicles \
  -H "Authorization: Bearer mock_token_test_002"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "veh-001",
    "licensePlate": "MAD-001-ABC",
    "model": "Sprinter",
    "make": "Mercedes",
    "year": 2022,
    "fuelType": "diesel",
    "initialOdometer": 5000,
    "currentOdometer": 5400
  }
]
```

### POST /fleet/vehicles
Crea un vehículo nuevo.

```bash
curl -X POST http://localhost:3000/fleet/vehicles \
  -H "Authorization: Bearer mock_token_test_002" \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "MAD-004-JKL",
    "model": "Vito",
    "make": "Mercedes",
    "year": 2023,
    "fuelType": "diesel",
    "initialOdometer": 1000
  }'
```

### POST /fleet/fuel-log
Registra un consumo de combustible.

```bash
curl -X POST http://localhost:3000/fleet/fuel-log \
  -H "Authorization: Bearer mock_token_test_002" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "veh-001",
    "odometerReading": 5500,
    "litersAdded": 50.0,
    "costEur": 60.50,
    "fuelType": "diesel",
    "logDate": "2026-05-25T10:00:00.000Z"
  }'
```

### GET /fleet/eco-score/:vehicleId
Obtiene eco-score calculado del vehículo.

```bash
curl -X GET http://localhost:3000/fleet/eco-score/veh-001 \
  -H "Authorization: Bearer mock_token_test_002"
```

### GET /fleet/reports/:vehicleId
Obtiene reportes de consumo del vehículo.

```bash
curl -X GET http://localhost:3000/fleet/reports/veh-001 \
  -H "Authorization: Bearer mock_token_test_002"
```

---

## 🏢 ORGANIZATIONS MODULE

### POST /organizations
Crea una organización (empresa).

```bash
curl -X POST http://localhost:3000/organizations \
  -H "Authorization: Bearer mock_token_test_002" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Logistics Corp",
    "companyType": "transport"
  }'
```

### GET /organizations/me
Obtiene la organización del usuario.

```bash
curl -X GET http://localhost:3000/organizations/me \
  -H "Authorization: Bearer mock_token_test_002"
```

### POST /organizations/:orgId/invite
Invita un miembro a la organización.

```bash
curl -X POST http://localhost:3000/organizations/org-001/invite \
  -H "Authorization: Bearer mock_token_test_002" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newdriver@logistics.com",
    "role": "driver"
  }'
```

---

## ⚙️ CONFIGURATOR MODULE

### POST /configurator/calculate
Calcula precio recomendado basado en costos.

```bash
curl -X POST http://localhost:3000/configurator/calculate \
  -H "Authorization: Bearer mock_token_test_001" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "diesel",
    "purchasePrice": 1.210,
    "operatingCosts": 0.150,
    "desiredMargin": 8.5,
    "zoneAvgPrice": 1.200
  }'
```

**Expected Response (200 OK):**
```json
{
  "purchasePrice": 1.210,
  "operatingCosts": 0.150,
  "desiredMargin": 8.5,
  "totalCostBase": 1.360,
  "marginAmount": 0.115,
  "recommendedPrice": 1.476,
  "zoneAvgPrice": 1.200,
  "vsZoneAvg": 23.0,
  "simulation": {
    "marginAt5pct": 1.428,
    "marginAt10pct": 1.496,
    "marginAt15pct": 1.564
  }
}
```

### POST /configurator/calculate-and-save
Calcula y guarda la configuración.

```bash
curl -X POST http://localhost:3000/configurator/calculate-and-save \
  -H "Authorization: Bearer mock_token_test_001" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "diesel",
    "purchasePrice": 1.210,
    "operatingCosts": 0.150,
    "desiredMargin": 8.5,
    "saveName": "Q2 2026 Pricing"
  }'
```

---

## 🎓 ACADEMY MODULE

### GET /academy/content
Obtiene todo el contenido educativo disponible.

```bash
curl -X GET http://localhost:3000/academy/content \
  -H "Authorization: Bearer mock_token_test_001"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "content-001",
    "title": "¿Por qué pagas de más en combustible?",
    "category": "fuel_prices",
    "level": "beginner",
    "duration": 720
  }
]
```

### GET /academy/content/:id
Obtiene un contenido específico.

```bash
curl -X GET http://localhost:3000/academy/content/content-001 \
  -H "Authorization: Bearer mock_token_test_001"
```

---

## 🛒 MARKETPLACE MODULE

### GET /marketplace/listings
Obtiene servicios disponibles en marketplace.

```bash
curl -X GET http://localhost:3000/marketplace/listings \
  -H "Authorization: Bearer mock_token_test_001"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "listing-001",
    "title": "Auditoría de combustible (1-3 vehículos)",
    "category": "audit",
    "priceEur": 299.99,
    "providerName": "CentralBuy Team",
    "rating": 4.8
  }
]
```

---

## 👨‍💼 CONSULTATIONS MODULE

### GET /consultations
Obtiene consultas del usuario.

```bash
curl -X GET http://localhost:3000/consultations \
  -H "Authorization: Bearer mock_token_test_002"
```

### POST /consultations/book
Booking de consultoría con experto.

```bash
curl -X POST http://localhost:3000/consultations/book \
  -H "Authorization: Bearer mock_token_test_002" \
  -H "Content-Type: application/json" \
  -d '{
    "consultantId": "cons-001",
    "scheduledAt": "2026-05-28T10:00:00Z",
    "duration": 60,
    "topicsDiscussed": ["fleet_optimization", "cost_reduction"]
  }'
```

### GET /consultations/consultants
Obtiene lista de consultores disponibles.

```bash
curl -X GET http://localhost:3000/consultations/consultants \
  -H "Authorization: Bearer mock_token_test_002"
```

---

## 📊 ADMIN MODULE

### GET /admin/users
Obtiene lista de usuarios (ADMIN ONLY).

```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer mock_token_admin_001"
```

### GET /admin/analytics
Obtiene métricas generales del sistema.

```bash
curl -X GET http://localhost:3000/admin/analytics \
  -H "Authorization: Bearer mock_token_admin_001"
```

---

## 🧪 Test All Endpoints Script

Para testing automatizado, crea un archivo `test-all.sh`:

```bash
#!/bin/bash

API="http://localhost:3000"
TOKEN_USER="mock_token_test_001"
TOKEN_EMPRESA="mock_token_test_002"
TOKEN_ADMIN="mock_token_admin_001"

echo "Testing Health Check..."
curl -s $API/health | jq .

echo -e "\n\nTesting Prices Latest..."
curl -s $API/prices/latest \
  -H "Authorization: Bearer $TOKEN_USER" | jq .

echo -e "\n\nTesting Prices Best..."
curl -s $API/prices/best \
  -H "Authorization: Bearer $TOKEN_USER" | jq .

echo -e "\n\nTesting Fleet Vehicles..."
curl -s $API/fleet/vehicles \
  -H "Authorization: Bearer $TOKEN_EMPRESA" | jq .

echo -e "\n\nDone!"
```

---

## ⚡ Tips para Testing

1. **Usar Insomnia o Postman** en lugar de curl para UI mejor
2. **Configurar environment variables** con tokens y URLs
3. **Usar scripts de pre-request** para generar datos dinámicamente
4. **Monitorear logs del backend**: `pnpm run start:dev 2>&1 | tee api.log`
5. **Verificar base de datos**: `docker-compose exec postgres psql -U postgres -d centralbuy`

---

## 🐛 Debugging

Si recibes errores de autenticación:
- Verifica que el token está en header Authorization: Bearer <token>
- Los tokens mock en desarrollo no se validan realmente
- En producción, Clerk manejará JWT validation

Si recibes 404:
- Verifica que el endpoint es correcto (typos en URLs)
- Confirma que el módulo está habilitado en app.module.ts

Si recibes 500:
- Revisa los logs del backend con `docker-compose logs api`
- Verifica conexión a PostgreSQL: `docker-compose exec postgres pg_isready -U postgres`
- Verifica conexión a Redis: `docker-compose exec redis redis-cli ping`

---

**Last Updated:** 2026-05-25
**Status:** Ready for Testing ✅
