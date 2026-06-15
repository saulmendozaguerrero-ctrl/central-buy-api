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
-- ECO-ACADEMY PILLS — Learning content for eco-driving education
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO eco_pills (id, slug, title, excerpt, category, "durationMin", "videoUrl", "imageUrl", difficulty, "accessLevel", "content", published, "createdAt", "updatedAt")
VALUES
  ('eco-pill-001', 'eco-driving-basics', 'Eco-Driving Fundamentals', 'Learn the core principles of eco-driving to reduce fuel consumption and emissions', 'eco-driving', 15, NULL, NULL, 'beginner', 'empresa', 'Eco-driving is a technique that combines the principles of ecological and economical driving. Key principles include: smooth acceleration, maintaining steady speeds, proper tire pressure, and reducing idling. These techniques can reduce fuel consumption by 10-15%', true, NOW(), NOW()),
  ('eco-pill-002', 'acceleration-techniques', 'Smooth Acceleration & Gear Management', 'Master the art of smooth acceleration and optimal gear selection for maximum fuel efficiency', 'eco-driving', 12, NULL, NULL, 'beginner', 'empresa', 'Harsh acceleration is one of the main causes of high fuel consumption. By accelerating gradually and smoothly, you can save up to 20% in fuel costs. Always aim for a steady, gradual increase in speed and plan your gear changes in advance.', true, NOW(), NOW()),
  ('eco-pill-003', 'speed-maintenance', 'Optimal Speed & Cruise Control', 'Discover how maintaining optimal speeds reduces fuel consumption and improves safety', 'eco-driving', 10, NULL, NULL, 'intermediate', 'empresa', 'Fuel consumption increases exponentially with speed. Driving at 110 km/h instead of 130 km/h can reduce fuel consumption by up to 25%. Using cruise control on highways helps maintain constant speed and reduces unnecessary acceleration and braking.', true, NOW(), NOW()),
  ('eco-pill-004', 'route-planning', 'Intelligent Route Planning & Idling', 'Plan efficient routes and eliminate unnecessary idling to maximize fuel savings', 'eco-driving', 12, NULL, NULL, 'intermediate', 'empresa', 'Idling (engine running without movement) wastes fuel and produces emissions. Modern vehicles don''t need warm-up time. By planning your route efficiently and using GPS navigation, you can reduce travel time and unnecessary fuel consumption by 15-20%.', true, NOW(), NOW()),
  ('eco-pill-005', 'vehicle-maintenance', 'Vehicle Maintenance & Tire Pressure', 'Ensure your vehicle is in peak condition for optimal fuel efficiency and safety', 'eco-driving', 14, NULL, NULL, 'advanced', 'empresa', 'Proper vehicle maintenance is crucial for fuel efficiency. Underinflated tires can increase fuel consumption by 3-5%. Regular servicing, clean air filters, and proper wheel alignment all contribute to better fuel economy and lower emissions. Check tire pressure monthly.', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ECO-ACADEMY QUIZZES — Assessment for each pill
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO eco_quizzes (id, title, questions, "passingScore", "timeLimit", published, "createdAt", "updatedAt")
VALUES
  ('eco-quiz-001', 'Eco-Driving Fundamentals Quiz', 
   '[{"id":"q1","text":"What percentage of fuel can you save by using eco-driving techniques?","options":[{"id":"opt1","text":"5-10%"},{"id":"opt2","text":"10-15%"},{"id":"opt3","text":"20-25%"},{"id":"opt4","text":"30-35%"}],"correctOptionId":"opt2"},{"id":"q2","text":"Which is the primary benefit of smooth acceleration?","options":[{"id":"opt5","text":"Faster travel time"},{"id":"opt6","text":"Reduced fuel consumption"},{"id":"opt7","text":"Increased vehicle lifespan"},{"id":"opt8","text":"Better handling"}],"correctOptionId":"opt6"}]'::jsonb,
   70, 10, true, NOW(), NOW()),
  ('eco-quiz-002', 'Acceleration & Gear Management Quiz',
   '[{"id":"q3","text":"How much can you save by accelerating smoothly?","options":[{"id":"opt9","text":"5%"},{"id":"opt10","text":"10%"},{"id":"opt11","text":"Up to 20%"},{"id":"opt12","text":"50%"}],"correctOptionId":"opt11"},{"id":"q4","text":"When should you change gears in eco-driving?","options":[{"id":"opt13","text":"At maximum RPM"},{"id":"opt14","text":"As soon as possible"},{"id":"opt15","text":"Plan gear changes in advance"},{"id":"opt16","text":"When the engine sounds loud"}],"correctOptionId":"opt15"}]'::jsonb,
   70, 10, true, NOW(), NOW()),
  ('eco-quiz-003', 'Optimal Speed Quiz',
   '[{"id":"q5","text":"How much fuel can you save by driving at 110 km/h instead of 130 km/h?","options":[{"id":"opt17","text":"5-10%"},{"id":"opt18","text":"15-20%"},{"id":"opt19","text":"Up to 25%"},{"id":"opt20","text":"40%"}],"correctOptionId":"opt19"},{"id":"q6","text":"What is an advantage of using cruise control?","options":[{"id":"opt21","text":"Faster acceleration"},{"id":"opt22","text":"Maintains constant speed"},{"id":"opt23","text":"Improves acceleration"},{"id":"opt24","text":"Reduces engine noise"}],"correctOptionId":"opt22"}]'::jsonb,
   70, 10, true, NOW(), NOW()),
  ('eco-quiz-004', 'Route Planning & Idling Quiz',
   '[{"id":"q7","text":"Do modern vehicles need warm-up time before driving?","options":[{"id":"opt25","text":"Yes, 5 minutes"},{"id":"opt26","text":"Yes, 2-3 minutes"},{"id":"opt27","text":"No, they do not"},{"id":"opt28","text":"Only in winter"}],"correctOptionId":"opt27"},{"id":"q8","text":"What percentage of fuel can be saved by eliminating unnecessary idling?","options":[{"id":"opt29","text":"5-10%"},{"id":"opt30","text":"10-15%"},{"id":"opt31","text":"15-20%"},{"id":"opt32","text":"30-40%"}],"correctOptionId":"opt31"}]'::jsonb,
   70, 10, true, NOW(), NOW()),
  ('eco-quiz-005', 'Vehicle Maintenance Quiz',
   '[{"id":"q9","text":"How much can underinflated tires increase fuel consumption?","options":[{"id":"opt33","text":"1-2%"},{"id":"opt34","text":"3-5%"},{"id":"opt35","text":"10-15%"},{"id":"opt36","text":"20-25%"}],"correctOptionId":"opt34"},{"id":"q10","text":"How often should you check tire pressure?","options":[{"id":"opt37","text":"Weekly"},{"id":"opt38","text":"Monthly"},{"id":"opt39","text":"Quarterly"},{"id":"opt40","text":"Annually"}],"correctOptionId":"opt38"}]'::jsonb,
   70, 10, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ECO-QUIZ-PILLS ASSOCIATION — Link quizzes to pills
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO eco_quiz_pills (quiz_id, pill_id)
VALUES
  ('eco-quiz-001', 'eco-pill-001'),
  ('eco-quiz-002', 'eco-pill-002'),
  ('eco-quiz-003', 'eco-pill-003'),
  ('eco-quiz-004', 'eco-pill-004'),
  ('eco-quiz-005', 'eco-pill-005')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ECO PROGRESS — Sample user progress
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO eco_progress (id, "userId", "completedPills", "completedQuizzes", "totalProgress", "pillsCompleted", "quizzesCompleted", "certificatesEarned", "createdAt", "updatedAt")
VALUES
  ('progress-001', 'user-test-002', '["eco-pill-001","eco-pill-002"]'::jsonb, '["eco-quiz-001","eco-quiz-002"]'::jsonb, 40, 2, 2, 2, NOW(), NOW()),
  ('progress-002', 'user-test-001', '["eco-pill-001"]'::jsonb, '["eco-quiz-001"]'::jsonb, 20, 1, 1, 1, NOW(), NOW())
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
       (SELECT COUNT(*) FROM organization) as organization_count,
       (SELECT COUNT(*) FROM eco_pills) as eco_pill_count,
       (SELECT COUNT(*) FROM eco_quizzes) as eco_quiz_count,
       (SELECT COUNT(*) FROM eco_progress) as eco_progress_count;
