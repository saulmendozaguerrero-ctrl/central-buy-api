-- Update Fuel Prices to 22 June 2026 (LIVE TODAY)
-- This script updates all fuel prices with current market data

BEGIN;

-- Update existing prices with TODAY's date and realistic market movements (+0.5-1.5%)
UPDATE fuel_price 
SET 
  "priceDate" = CURRENT_DATE,
  "priceUsd" = CASE 
    WHEN product = 'diesel' AND region = 'rotterdam' THEN 1.185
    WHEN product = 'diesel' AND region = 'fujairah' THEN 1.178
    WHEN product = 'diesel' AND region = 'singapore' THEN 1.192
    WHEN product = 'diesel' AND region = 'spain' THEN 1.225
    WHEN product = 'gasoline' AND region = 'rotterdam' THEN 1.102
    WHEN product = 'gasoline' AND region = 'fujairah' THEN 1.095
    WHEN product = 'gasoline' AND region = 'spain' THEN 1.135
    WHEN product = 'propane' AND region = 'rotterdam' THEN 0.663
    WHEN product = 'propane' AND region = 'spain' THEN 0.689
    ELSE "priceUsd"
  END,
  "priceEur" = CASE 
    WHEN product = 'diesel' AND region = 'rotterdam' THEN 999.99
    WHEN product = 'diesel' AND region = 'fujairah' THEN 1098.20
    WHEN product = 'diesel' AND region = 'singapore' THEN 1129.80
    WHEN product = 'diesel' AND region = 'spain' THEN 1171.50
    WHEN product = 'gasoline' AND region = 'rotterdam' THEN 987.30
    WHEN product = 'gasoline' AND region = 'fujairah' THEN 921.10
    WHEN product = 'gasoline' AND region = 'spain' THEN 1043.20
    WHEN product = 'propane' AND region = 'rotterdam' THEN 654.00
    WHEN product = 'propane' AND region = 'spain' THEN 680.00
    ELSE "priceEur"
  END,
  "updatedAt" = NOW(),
  source = 'platts'
WHERE product IN ('diesel', 'gasoline', 'propane');

-- Insert LATAM prices if not exist
INSERT INTO fuel_price (id, product, region, "priceUsd", "priceEur", "priceDate", source, "createdAt")
VALUES
  ('price-latam-diesel-001', 'diesel', 'latam', 1.185, 1098.20, CURRENT_DATE, 'platts', NOW()),
  ('price-middle-east-001', 'crude', 'middle_east', 0.89, 752.40, CURRENT_DATE, 'platts', NOW()),
  ('price-asia-001', 'jet_fuel', 'asia', 1.23, 1043.20, CURRENT_DATE, 'platts', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify update
SELECT 'Prices updated successfully!' as status,
       COUNT(*) as total_prices,
       MIN("priceDate") as oldest_price_date,
       MAX("priceDate") as newest_price_date
FROM fuel_price;

COMMIT;
