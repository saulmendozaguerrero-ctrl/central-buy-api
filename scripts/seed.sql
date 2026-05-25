-- Central Buy API — Development Seed Data
-- This script creates sample data for testing all modules locally

-- ═══════════════════════════════════════════════════════════════════════════════
-- USERS — Admin + Test Users
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO "user" (id, email, "firstName", "lastName", plan, "clerkId", "createdAt", "updatedAt")
VALUES
  ('user-admin-001', 'admin@centralbuy.local', 'Admin', 'User', 'admin', 'clerk_admin_001', NOW(), NOW()),
  ('user-test-001', 'particular@centralbuy.local', 'John', 'Doe', 'particular', 'clerk_test_001', NOW(), NOW()),
  ('user-test-002', 'empresa@centralbuy.local', 'Jane', 'Smith', 'empresa', 'clerk_test_002', NOW(), NOW()),
  ('user-test-003', 'consultant@centralbuy.local', 'Dr. Energy', 'Expert', 'particular', 'clerk_consultant_001', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SUBSCRIPTIONS — Active subscriptions for test users
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO subscription (id, "userId", plan, status, "stripeCustomerId", "stripePriceId", "currentPeriodStart", "currentPeriodEnd", "createdAt", "updatedAt")
VALUES
  ('sub-001', 'user-test-001', 'particular', 'active', 'cus_test_001', 'price_dev_particular_4_99', NOW(), NOW() + INTERVAL '30 days', NOW(), NOW()),
  ('sub-002', 'user-test-002', 'empresa', 'active', 'cus_test_002', 'price_dev_empresa_9_99', NOW(), NOW() + INTERVAL '30 days', NOW(), NOW()),
  ('sub-003', 'user-test-003', 'particular', 'active', 'cus_test_003', 'price_dev_particular_4_99', NOW(), NOW() + INTERVAL '30 days', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUEL PRICES — Sample prices from different regions
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO fuel_price (id, product, region, "priceUsd", "priceEur", "priceDate", source, "createdAt")
VALUES
  -- Diesel Prices (Multiple Regions)
  ('price-001', 'diesel', 'rotterdam', 1.171, 1.089, NOW(), 'platts', NOW()),
  ('price-002', 'diesel', 'fujairah', 1.165, 1.084, NOW(), 'platts', NOW()),
  ('price-003', 'diesel', 'singapore', 1.178, 1.095, NOW(), 'platts', NOW()),
  ('price-004', 'diesel', 'spain', 1.210, 1.123, NOW(), 'manual', NOW()),
  
  -- Gasoline Prices
  ('price-005', 'gasoline', 'rotterdam', 1.089, 1.011, NOW(), 'platts', NOW()),
  ('price-006', 'gasoline', 'fujairah', 1.082, 1.005, NOW(), 'platts', NOW()),
  ('price-007', 'gasoline', 'spain', 1.120, 1.040, NOW(), 'manual', NOW()),
  
  -- Propane Prices
  ('price-008', 'propane', 'rotterdam', 0.654, 0.607, NOW(), 'platts', NOW()),
  ('price-009', 'propane', 'spain', 0.680, 0.631, NOW(), 'manual', NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ORGANIZATIONS — Test companies
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO organization (id, "ownerId", name, "companyType", "maxUsers", "createdAt", "updatedAt")
VALUES
  ('org-001', 'user-test-002', 'TransportCorp SA', 'transport', 20, NOW(), NOW()),
  ('org-002', 'user-test-003', 'Energy Consulting', 'consulting', 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ORG MEMBERS — Assign users to organizations
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO org_member ("orgId", "userId", role, "joinedAt")
VALUES
  ('org-001', 'user-test-002', 'admin', NOW()),
  ('org-002', 'user-test-003', 'admin', NOW())
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VEHICLES — Sample fleet for empresa user
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO vehicle (id, "subscriptionId", licensePlate, model, make, year, "fuelType", "initialOdometer", "createdAt", "updatedAt")
VALUES
  ('veh-001', 'sub-002', 'MAD-001-ABC', 'Sprinter', 'Mercedes', 2022, 'diesel', 5000, NOW(), NOW()),
  ('veh-002', 'sub-002', 'MAD-002-DEF', 'Iveco Daily', 'Iveco', 2021, 'diesel', 8000, NOW(), NOW()),
  ('veh-003', 'sub-002', 'MAD-003-GHI', 'Peugeot Boxer', 'Peugeot', 2023, 'diesel', 2000, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUEL LOGS — Sample consumption data
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO fuel_log (id, "vehicleId", "odometerReading", "litersAdded", "costEur", "fuelType", "logDate", "createdAt", "updatedAt")
VALUES
  -- Vehicle 001 logs
  ('log-001', 'veh-001', 5100, 50.5, 61.11, 'diesel', NOW() - INTERVAL '10 days', NOW(), NOW()),
  ('log-002', 'veh-001', 5250, 48.3, 58.61, 'diesel', NOW() - INTERVAL '5 days', NOW(), NOW()),
  ('log-003', 'veh-001', 5400, 52.1, 63.24, 'diesel', NOW() - INTERVAL '1 day', NOW(), NOW()),
  
  -- Vehicle 002 logs
  ('log-004', 'veh-002', 8100, 55.0, 66.65, 'diesel', NOW() - INTERVAL '8 days', NOW(), NOW()),
  ('log-005', 'veh-002', 8300, 51.2, 62.06, 'diesel', NOW() - INTERVAL '2 days', NOW(), NOW()),
  
  -- Vehicle 003 logs
  ('log-006', 'veh-003', 2100, 45.0, 54.54, 'diesel', NOW() - INTERVAL '6 days', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PRICE CONFIGS — User saved configurations
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO price_config (id, "userId", name, product, "purchasePrice", "operatingCosts", "desiredMargin", "recommendedPrice", "zoneAvgPrice", "createdAt", "updatedAt")
VALUES
  ('config-001', 'user-test-001', 'Q2 Diesel Pricing', 'diesel', 1.210, 0.150, 8.5, 1.334, 1.200, NOW(), NOW()),
  ('config-002', 'user-test-002', 'Fleet Cost Analysis', 'diesel', 1.210, 0.200, 10.0, 1.361, 1.195, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- CONSULTANTS — Expert profiles
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO consultant (id, name, email, specialty, "ratePerHour", bio, "isActive", "createdAt", "updatedAt")
VALUES
  ('cons-001', 'Dr. Miguel Energía', 'miguel@centralbuy.local', 'fuel_optimization', 150, 'Especialista en optimización de combustibles con 15 años de experiencia', true, NOW(), NOW()),
  ('cons-002', 'Ing. María Logística', 'maria@centralbuy.local', 'fleet_management', 120, 'Ingeniera de logística especializada en gestión de flotas', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ACADEMY CONTENT — Educational materials
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO academy_content (id, title, description, category, "contentType", "videoUrl", duration, level, "isPublished", "createdAt", "updatedAt")
VALUES
  ('content-001', '¿Por qué pagas de más en combustible?', 'Análisis de factores que afectan precios y cómo optimizar costos', 'fuel_prices', 'video', 'https://youtube.com/embed/example1', 720, 'beginner', true, NOW(), NOW()),
  ('content-002', 'Eco-driving: Técnicas avanzadas', 'Maximiza ahorro de combustible con eco-driving certificado', 'eco_driving', 'course', NULL, 1800, 'intermediate', true, NOW(), NOW()),
  ('content-003', 'Gestión de flotas: Best practices', 'Optimiza tu flota con sistemas de tracking y reporting', 'fleet_management', 'guide', NULL, NULL, 'advanced', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MARKETPLACE LISTINGS — Services available
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO marketplace_listing (id, title, description, category, "priceEur", "providerName", rating, "isActive", "createdAt", "updatedAt")
VALUES
  ('listing-001', 'Auditoría de combustible (1-3 vehículos)', 'Análisis completo de consumo y recomendaciones', 'audit', 299.99, 'CentralBuy Team', 4.8, true, NOW(), NOW()),
  ('listing-002', 'Sistema de tracking GPS (instalación)', 'GPS telemática para monitoreo en tiempo real', 'tracking', 1299.99, 'TechFleet Partners', 4.9, true, NOW(), NOW()),
  ('listing-003', 'Plan mensual de asesoría personalizada', 'Consultoría con expert in fuel optimization', 'consulting', 499.99, 'Dr. Miguel Energía', 4.7, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- CONSULTATION BOOKINGS — Sample consultations
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO consultation (id, "userId", "consultantId", "scheduledAt", duration, status, "topicsDiscussed", notes, "createdAt", "updatedAt")
VALUES
  ('consult-001', 'user-test-002', 'cons-001', NOW() + INTERVAL '3 days' + INTERVAL '10 hours', 60, 'scheduled', 'fleet_optimization,cost_reduction', 'Initial consultation para TransportCorp SA', NOW(), NOW()),
  ('consult-002', 'user-test-001', 'cons-002', NOW() + INTERVAL '5 days' + INTERVAL '14 hours', 45, 'scheduled', 'eco_driving', 'Personal eco-driving coaching', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFY SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT 'Seed data loaded successfully!' as status,
       (SELECT COUNT(*) FROM "user") as user_count,
       (SELECT COUNT(*) FROM subscription) as subscription_count,
       (SELECT COUNT(*) FROM fuel_price) as price_count,
       (SELECT COUNT(*) FROM vehicle) as vehicle_count,
       (SELECT COUNT(*) FROM fuel_log) as fuel_log_count,
       (SELECT COUNT(*) FROM organization) as organization_count;
