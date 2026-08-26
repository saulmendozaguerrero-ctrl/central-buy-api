-- =============================================================================
-- PLATTS DATA MIGRATION
-- Creates tables for storing Platts European Marketscan data
-- Run against the Railway PostgreSQL database
-- =============================================================================

-- Create enum types (skip if they already exist)
DO $$ BEGIN
  CREATE TYPE platts_category AS ENUM (
    'crude', 'diesel', 'gasoline', 'jet', 'naphtha', 
    'fueloil', 'marine_fuel', 'carbon', 'swap', 'biofuel'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE platts_region AS ENUM (
    'mediterranean', 'nw_europe', 'rotterdam', 
    'west_africa', 'singapore', 'us_gulf', 'global'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- Table: platts_prices
-- Individual commodity price entries from Platts reports
-- =============================================================================
CREATE TABLE IF NOT EXISTS platts_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Report date
  price_date DATE NOT NULL,
  
  -- Classification
  category platts_category NOT NULL,
  region platts_region NOT NULL,
  product_key VARCHAR(100) NOT NULL,
  product_label VARCHAR(255) NOT NULL,
  
  -- Pricing
  price_usd DECIMAL(12, 4) NOT NULL,
  price_eur DECIMAL(12, 4),
  unit VARCHAR(20) DEFAULT '$/mt',
  
  -- Day-over-day changes
  change_usd DECIMAL(10, 4),
  change_pct DECIMAL(8, 4),
  
  -- Delivery/pricing type (FOB, CIF, Barge, etc.)
  delivery_type VARCHAR(30),
  
  -- Source tracking
  source VARCHAR(30) DEFAULT 'linkedin_scrape',
  source_url VARCHAR(500),
  raw_snippet TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_platts_prices_date_cat_region 
  ON platts_prices (price_date, category, region);
CREATE INDEX IF NOT EXISTS idx_platts_prices_date 
  ON platts_prices (price_date);
CREATE INDEX IF NOT EXISTS idx_platts_prices_product_date 
  ON platts_prices (product_key, price_date);

-- =============================================================================
-- Table: platts_snapshots
-- Full report snapshots (one per day) with context
-- =============================================================================
CREATE TABLE IF NOT EXISTS platts_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Report identification
  report_date DATE NOT NULL UNIQUE,
  source_pub VARCHAR(255) DEFAULT 'Platts European Marketscan',
  volume_issue VARCHAR(50),
  
  -- Key forex & crude rates
  eur_usd DECIMAL(8, 4),
  gbp_usd DECIMAL(8, 4),
  brent_front_month DECIMAL(8, 2),
  
  -- Context (Rhine level, refinery news, geopolitical, etc.)
  context JSONB,
  
  -- Complete parsed data
  full_data JSONB,
  
  -- LinkedIn source
  linkedin_post_url VARCHAR(500),
  raw_post_text TEXT,
  
  -- Processing status
  status VARCHAR(20) DEFAULT 'processed',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_platts_snapshots_date 
  ON platts_snapshots (report_date);

-- =============================================================================
-- Sample data seeding (latest.json from the app)
-- =============================================================================

-- Insert snapshot for 2026-07-30
INSERT INTO platts_snapshots (report_date, source_pub, brent_front_month, context, status)
VALUES (
  '2026-07-30',
  'Platts European Marketscan',
  89.90,
  '{
    "rhine_kaub_cm": 29,
    "rhine_note": "Nearing 2018 record low of 25cm. Vessel loading at 20% capacity.",
    "jazan_refinery": "400,000 b/d fully offline (attack July 25)",
    "neste_rotterdam": "8 weeks maintenance planned Q4 2026",
    "russia_export_ban": "Gasoline + diesel ban extended to Jan 31, 2027",
    "iran_tensions": "US-Iran conflict supporting risk premiums",
    "ara_gasoline_inventory": "982,000 mt (+21.23%)"
  }'::jsonb,
  'processed'
)
ON CONFLICT (report_date) DO NOTHING;

-- Insert key prices for 2026-07-30
INSERT INTO platts_prices (price_date, category, region, product_key, product_label, price_usd, unit, delivery_type, source)
VALUES
  -- Crude
  ('2026-07-30', 'crude', 'global', 'brent_sep', 'Brent Sep', 89.90, '$/bbl', 'Futures', 'manual'),
  ('2026-07-30', 'crude', 'global', 'brent_oct', 'Brent Oct', 87.26, '$/bbl', 'Futures', 'manual'),
  
  -- Diesel
  ('2026-07-30', 'diesel', 'mediterranean', 'ulsd_10ppm_fob_med', 'ULSD 10ppm FOB MED', 1373.000, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'diesel', 'mediterranean', 'ulsd_10ppm_cif_med', 'ULSD 10ppm CIF MED', 1392.750, '$/mt', 'CIF', 'manual'),
  ('2026-07-30', 'diesel', 'nw_europe', 'ulsd_10ppm_fob_nwe', 'ULSD 10ppm FOB NWE', 1307.250, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'diesel', 'nw_europe', 'ulsd_10ppm_cif_nwe', 'ULSD 10ppm CIF NWE', 1321.500, '$/mt', 'CIF', 'manual'),
  ('2026-07-30', 'diesel', 'rotterdam', 'diesel_10ppm_fob_rotterdam', 'Diesel 10ppm FOB Rotterdam Barges', 1327.250, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'diesel', 'nw_europe', 'gasoil_01_fob_nwe', 'Gasoil 0.1% FOB NWE', 1193.500, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'diesel', 'rotterdam', 'gasoil_01_fob_rotterdam', 'Gasoil 0.1% FOB Rotterdam', 1213.500, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'diesel', 'west_africa', 'diesel_ls_sts_lome', 'Diesel LS STS Lomé', 1384.250, '$/mt', 'STS', 'manual'),
  
  -- Gasoline
  ('2026-07-30', 'gasoline', 'mediterranean', 'prem_unl_10ppm_fob_med', 'Premium Unleaded 10ppm FOB MED', 1085.000, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'gasoline', 'nw_europe', 'gasoline_10ppm_cif_nwe', 'Gasoline 10ppm CIF NWE', 1148.750, '$/mt', 'CIF', 'manual'),
  ('2026-07-30', 'gasoline', 'rotterdam', 'eurobob_fob_rotterdam', 'Eurobob FOB Rotterdam', 1093.750, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'gasoline', 'rotterdam', 'e10_eurobob_fob_rotterdam', 'E10 Eurobob FOB Rotterdam', 1069.750, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'gasoline', 'rotterdam', 'ron98_fob_rotterdam', 'RON98 FOB Rotterdam', 1201.250, '$/mt', 'FOB', 'manual'),
  
  -- Jet Fuel
  ('2026-07-30', 'jet', 'mediterranean', 'jet_fob_med', 'Jet Fuel FOB MED', 1279.000, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'jet', 'nw_europe', 'jet_fob_nwe', 'Jet Fuel FOB NWE', 1294.750, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'jet', 'nw_europe', 'jet_cif_nwe', 'Jet Fuel CIF NWE', 1316.500, '$/mt', 'CIF', 'manual'),
  ('2026-07-30', 'jet', 'rotterdam', 'jet_fob_rotterdam', 'Jet Fuel FOB Rotterdam', 1319.750, '$/mt', 'FOB', 'manual'),
  
  -- Naphtha
  ('2026-07-30', 'naphtha', 'mediterranean', 'naphtha_fob_med', 'Naphtha FOB MED', 743.750, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'naphtha', 'nw_europe', 'naphtha_cif_nwe', 'Naphtha CIF NWE', 770.500, '$/mt', 'CIF', 'manual'),
  ('2026-07-30', 'naphtha', 'nw_europe', 'naphtha_physical_cif_nwe', 'Naphtha Physical CIF NWE', 786.750, '$/mt', 'CIF', 'manual'),
  ('2026-07-30', 'naphtha', 'rotterdam', 'naphtha_fob_rotterdam', 'Naphtha FOB Rotterdam', 782.750, '$/mt', 'FOB', 'manual'),
  
  -- Fuel Oil
  ('2026-07-30', 'fueloil', 'mediterranean', 'fo_1pct_fob_med', 'Fuel Oil 1% FOB MED', 548.250, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'fueloil', 'mediterranean', 'fo_35pct_fob_med', 'Fuel Oil 3.5% FOB MED', 478.000, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'fueloil', 'rotterdam', 'fo_1pct_fob_rotterdam', 'Fuel Oil 1% FOB Rotterdam', 519.500, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'fueloil', 'rotterdam', 'fo_35pct_fob_rotterdam', 'Fuel Oil 3.5% FOB Rotterdam', 484.750, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'fueloil', 'rotterdam', 'bunker_380cst_rotterdam', 'Bunker 380cst Rotterdam', 535.000, '$/mt', 'FOB', 'manual'),
  
  -- Marine Fuel
  ('2026-07-30', 'marine_fuel', 'rotterdam', 'mf_05pct_fob_rotterdam', 'Marine Fuel 0.5% FOB Rotterdam', 630.750, '$/mt', 'FOB', 'manual'),
  ('2026-07-30', 'marine_fuel', 'mediterranean', 'mf_05pct_fob_med', 'Marine Fuel 0.5% FOB MED', 625.000, '$/mt', 'FOB', 'manual')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- Insert snapshot for 2026-07-29 (second data point for history)
-- =============================================================================
INSERT INTO platts_snapshots (report_date, source_pub, volume_issue, eur_usd, brent_front_month, context, status)
VALUES (
  '2026-07-29',
  'S&P Global Platts European Marketscan',
  'Vol.58 Issue 145',
  1.1380,
  90.51,
  '{
    "hormuz_tensions": true,
    "rhine_water_level_kaub_cm": 29,
    "jazan_refinery_offline": true,
    "russian_refineries_hit": ["Ryazan", "Perm"]
  }'::jsonb,
  'processed'
)
ON CONFLICT (report_date) DO NOTHING;

INSERT INTO platts_prices (price_date, category, region, product_key, product_label, price_usd, unit, delivery_type, source)
VALUES
  ('2026-07-29', 'crude', 'global', 'brent_sep', 'Brent Sep', 90.51, '$/bbl', 'Futures', 'manual'),
  ('2026-07-29', 'diesel', 'mediterranean', 'ulsd_10ppm_fob_med', 'ULSD 10ppm FOB MED', 1380.750, '$/mt', 'FOB', 'manual'),
  ('2026-07-29', 'diesel', 'nw_europe', 'ulsd_10ppm_cif_nwe', 'ULSD 10ppm CIF NWE', 1402.000, '$/mt', 'CIF', 'manual'),
  ('2026-07-29', 'gasoline', 'mediterranean', 'prem_unl_10ppm_fob_med', 'Premium Unleaded 10ppm FOB MED', 1110.000, '$/mt', 'FOB', 'manual'),
  ('2026-07-29', 'gasoline', 'rotterdam', 'eurobob_fob_rotterdam', 'Eurobob FOB Rotterdam', 1124.250, '$/mt', 'FOB', 'manual'),
  ('2026-07-29', 'jet', 'mediterranean', 'jet_fob_med', 'Jet Fuel FOB MED', 1266.250, '$/mt', 'FOB', 'manual'),
  ('2026-07-29', 'jet', 'nw_europe', 'jet_cif_nwe', 'Jet Fuel CIF NWE', 1306.250, '$/mt', 'CIF', 'manual'),
  ('2026-07-29', 'naphtha', 'mediterranean', 'naphtha_fob_med', 'Naphtha FOB MED', 747.750, '$/mt', 'FOB', 'manual'),
  ('2026-07-29', 'naphtha', 'nw_europe', 'naphtha_cif_nwe', 'Naphtha CIF NWE', 775.500, '$/mt', 'CIF', 'manual'),
  ('2026-07-29', 'fueloil', 'mediterranean', 'fo_1pct_fob_med', 'Fuel Oil 1% FOB MED', 552.500, '$/mt', 'FOB', 'manual'),
  ('2026-07-29', 'fueloil', 'rotterdam', 'fo_1pct_fob_rotterdam', 'Fuel Oil 1% FOB Rotterdam', 638.750, '$/mt', 'FOB', 'manual'),
  ('2026-07-29', 'marine_fuel', 'rotterdam', 'mf_05pct_fob_rotterdam', 'Marine Fuel 0.5% FOB Rotterdam', 638.750, '$/mt', 'FOB', 'manual')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- Verify the data
-- =============================================================================
SELECT 
  'Snapshots' as table_name, 
  COUNT(*) as count 
FROM platts_snapshots
UNION ALL
SELECT 
  'Prices' as table_name, 
  COUNT(*) as count 
FROM platts_prices;

SELECT 
  report_date, 
  brent_front_month, 
  status 
FROM platts_snapshots 
ORDER BY report_date DESC;
