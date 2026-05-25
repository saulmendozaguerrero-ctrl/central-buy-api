# 🧪 Central Buy API — Local Testing Setup

**Status:** ✅ Ready to test
**Date:** 2026-05-25
**Completado:** 11/11 módulos backend habilitados

---

## 🚀 Quick Start (5 min)

### Requisitos
- Docker + Docker Compose instalados
- Node.js 22+ + pnpm
- PostgreSQL CLI (opcional, para debugging)

### Setup

```bash
# 1. En tu Mac, entra al directorio del proyecto
cd ~/Desktop/"central buy app"/central-buy-api

# 2. Ejecuta el script de setup (levanta PostgreSQL + Redis + carga seed data)
./scripts/local-setup.sh

# 3. Instala dependencias (si no las tienes)
pnpm install

# 4. Inicia el backend en modo development
pnpm run start:dev

# 5. ✅ Backend está listo en http://localhost:3000
```

**Esperado en terminal:**
```
[Nest] 12345   - 05/25/2026, 4:30:00 PM   LOG [NestFactory] Starting Nest application...
[Nest] 12345   - 05/25/2026, 4:30:00 PM   LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] 12345   - 05/25/2026, 4:30:00 PM   LOG [InstanceLoader] ConfigModule dependencies initialized
...
[Nest] 12345   - 05/25/2026, 4:30:01 PM   LOG [NestApplication] Nest application successfully started
```

---

## 📊 Verificar Status

### Health Check

```bash
curl http://localhost:3000/health
```

**Response esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-25T15:30:00.000Z",
  "version": "1.0.0"
}
```

### Swagger Documentation

Abre en tu navegador:
```
http://localhost:3000/api/docs
```

Aquí ves todos los endpoints documentados con ejemplos.

### Verificar Base de Datos

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U postgres -d centralbuy

# En el prompt psql, prueba:
SELECT COUNT(*) FROM "user";
SELECT COUNT(*) FROM fuel_price;
SELECT * FROM "user" LIMIT 5;

# Salir
\q
```

### Verificar Redis

```bash
docker-compose exec redis redis-cli ping
# Debería responder: PONG
```

---

## 🧪 Testing Endpoints

### Opción A: Usar Swagger UI (Más fácil)

1. Abre http://localhost:3000/api/docs
2. Cada endpoint tiene botón "Try it out"
3. Modifica parámetros si es necesario
4. Click "Execute"

### Opción B: Usar cURL

Ver archivo `scripts/test-endpoints.md` con ejemplos de todos los endpoints.

**Ejemplo rápido:**

```bash
# GET /prices/latest
curl http://localhost:3000/prices/latest \
  -H "Authorization: Bearer mock_token_test_001"

# GET /prices/best
curl http://localhost:3000/prices/best \
  -H "Authorization: Bearer mock_token_test_001"

# GET /fleet/vehicles
curl http://localhost:3000/fleet/vehicles \
  -H "Authorization: Bearer mock_token_test_002"
```

### Opción C: Usar Postman/Insomnia (Recomendado)

1. Descarga Postman (https://www.postman.com/downloads/)
2. Importa collection (copiar endpoints de test-endpoints.md)
3. Configura environment variables:
   - `api_url`: http://localhost:3000
   - `token_user`: mock_token_test_001
   - `token_empresa`: mock_token_test_002
   - `token_admin`: mock_token_admin_001
4. Testing automático

---

## 👤 Test Users (Seed Data)

```
Email                    | Plan         | Role      | Subscription
─────────────────────────┼──────────────┼───────────┼──────────────
particular@centralbuy.local | particular | user      | sub-001 (€4.99)
empresa@centralbuy.local    | empresa    | business  | sub-002 (€9.99)
consultant@centralbuy.local | particular | user      | sub-003 (€4.99)
admin@centralbuy.local      | admin      | admin     | N/A
```

**Nota:** En desarrollo, los tokens mock no se validan. En producción, Clerk maneja JWT.

---

## 📝 Testing Checklist

### ✅ Core Functionality

- [ ] **Health Check:** GET /health → 200
- [ ] **Prices — Latest:** GET /prices/latest → 9 precios
- [ ] **Prices — Best:** GET /prices/best → 3 productos (diesel, gasoline, propane)
- [ ] **Fleet — Vehicles:** GET /fleet/vehicles → 3 vehículos (para empresa user)
- [ ] **Organizations:** GET /organizations/me → org-001 (TransportCorp SA)
- [ ] **Configurator:** POST /configurator/calculate → recomendación de precio

### ✅ Auth Flow

- [ ] **Register:** POST /auth/register → usuario nuevo
- [ ] **Login:** POST /auth/login → token (mock en dev)
- [ ] **Protected Routes:** Requests sin Authorization header → 401

### ✅ Subscriptions

- [ ] **Get Subscription:** GET /subscriptions → suscripción activa
- [ ] **Checkout Session:** POST /subscriptions/checkout → Stripe session URL

### ✅ Fleet Management

- [ ] **Fuel Log:** POST /fleet/fuel-log → consumo registrado
- [ ] **Eco Score:** GET /fleet/eco-score/:id → puntaje calculado
- [ ] **Reports:** GET /fleet/reports/:id → reportes de consumo

### ✅ Organizations

- [ ] **Create Org:** POST /organizations → nueva empresa
- [ ] **Invite Member:** POST /organizations/:id/invite → miembro invitado

### ✅ Advanced Features

- [ ] **Academy:** GET /academy/content → 3 contenidos educativos
- [ ] **Marketplace:** GET /marketplace/listings → 3 servicios
- [ ] **Consultations:** POST /consultations/book → consulta reservada

---

## 🐛 Troubleshooting

### Problema: "Cannot connect to PostgreSQL"

```bash
# Verifica que el contenedor está activo
docker-compose ps

# Si no está, reinicia
docker-compose down
docker-compose up -d
docker-compose logs postgres
```

### Problema: "Port 5432 already in use"

Algo más ya está usando el puerto. Opción A:

```bash
# Cambiar puerto en docker-compose.yml
# Modificar: 5432:5432 → 5433:5432

# Luego actualiza .env
DATABASE_PORT=5433
```

Opción B: Detener otros servicios PostgreSQL.

### Problema: "seed.sql not found"

Verifica que estás en el directorio correcto:

```bash
cd ~/Desktop/"central buy app"/central-buy-api
ls scripts/seed.sql  # Debería existir
```

### Problema: "pnpm not found"

Instálalo globalmente:

```bash
npm install -g pnpm
pnpm --version  # Debería mostrar versión
```

### Problema: Backend no inicia

```bash
# Ver logs detallados
pnpm run start:dev 2>&1 | head -50

# Verificar que PostgreSQL está listo
docker-compose exec postgres pg_isready -U postgres

# Verificar que Redis está listo
docker-compose exec redis redis-cli ping
```

### Problema: "TypeScript compilation errors"

```bash
# Limpiar cache y reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run build  # Verificar compilación
```

---

## 🧹 Cleanup

### Detener containers (mantiene data)

```bash
docker-compose stop
```

### Detener + Eliminar containers (mantiene volúmenes)

```bash
docker-compose down
```

### Eliminar todo (reset total)

```bash
docker-compose down -v  # Elimina volúmenes también
```

Después, puedes re-ejecutar `./scripts/local-setup.sh` para empezar limpio.

---

## 📚 Documentación Endpoints

Completa en: `scripts/test-endpoints.md`

Incluye:
- GET /prices/* (latest, best, by-product, by-region, history)
- POST /subscriptions/checkout
- POST/GET /fleet/* (vehicles, fuel-log, eco-score, reports)
- POST/GET /organizations/* (create, me, invite-member)
- POST /configurator/calculate
- GET /academy/content
- GET /marketplace/listings
- POST /consultations/book
- GET /admin/*

---

## 🔗 URLs Útiles

| Servicio | URL |
|----------|-----|
| **Backend API** | http://localhost:3000 |
| **Swagger Docs** | http://localhost:3000/api/docs |
| **PostgreSQL** | localhost:5432 |
| **Redis** | localhost:6379 |
| **Frontend** | http://localhost:3001 (próximamente) |

---

## 🎯 Próximos Pasos

1. ✅ **Backend testing local** (AHORA)
2. ⏳ **Frontend (Next.js) desbloqueo** (mañana)
3. ⏳ **Integration testing** (Swagger + Postman)
4. ⏳ **Deploy staging** (Vercel + Railway)

---

## ⚡ Tips Pro

1. **Usar `pnpm run dev:watch`** para auto-reload en cambios
2. **Monitorear logs:** `docker-compose logs -f postgres` (en otra terminal)
3. **Resetear seed data:** `docker-compose down -v && ./scripts/local-setup.sh`
4. **Debug queries:** Habilitar logging en app.module.ts (`logging: true` en TypeORM)
5. **Postman collection:** Copiar endpoints de test-endpoints.md → Postman

---

## 📞 Support

Si encuentras problemas:
1. Revisa logs: `pnpm run start:dev 2>&1 | tee backend.log`
2. Verifica conectividad: `docker-compose ps`
3. Consulta troubleshooting arriba
4. Abre issue en GitHub repo

---

**Backend está 100% listo para testing. ¡Adelante!** 🚀

**Last Updated:** 2026-05-25 16:15 GMT+2
