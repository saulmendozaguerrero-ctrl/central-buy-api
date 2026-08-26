const { Client } = require('pg');
const client = new Client({ 
  connectionString: 'postgresql://postgres:mBBAXwUbPpaCxhFqZkeqXjkcpfbqrUbw@acela.proxy.rlwy.net:47273/railway', 
  ssl: { rejectUnauthorized: false } 
});

// Precios reales como ancla (19 agosto 2026):
// diesel_europe: 1404 USD/mt, gasoline: 1111 USD/mt, jet: 1309, fuel_oil: 546, crude: 825 USD/bbl

const EUR_RATE = 0.9174; // 1 USD = 0.9174 EUR

function gauss(mean, stdDev) {
  // Box-Muller
  const u1 = Math.random(), u2 = Math.random();
  return mean + stdDev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Génera serie de precios con drift lento y volatilidad diaria
function generateSeries(finalPrice, days, dailyVol) {
  const prices = [finalPrice];
  for (let i = 1; i < days; i++) {
    // Walk backwards: precio de ayer = precio hoy + ruido
    const prev = prices[prices.length - 1] * (1 + gauss(0, dailyVol));
    prices.push(Math.max(prev, finalPrice * 0.7));
  }
  return prices.reverse(); // cronológico: más antiguo primero
}

async function seed() {
  await client.connect();
  
  // Eliminar registros sintéticos anteriores para no duplicar
  await client.query("DELETE FROM fuel_prices WHERE source='cb_market_hist'");
  
  const today = new Date('2026-08-19');
  const days = 90;
  
  // Anclas finales (19 agosto)
  const anchors = {
    diesel:    { usd: 1404,  vol: 0.008 },
    gasoline:  { usd: 1111,  vol: 0.009 },
    jet_fuel:  { usd: 1309,  vol: 0.007 },
    fuel_oil:  { usd: 546,   vol: 0.010 },
    crude:     { usd: 825,   vol: 0.006 }, // bbl → convertir a mt si fuera necesario
  };

  let inserted = 0;
  
  for (const [product, cfg] of Object.entries(anchors)) {
    const series = generateSeries(cfg.usd, days, cfg.vol);
    
    for (let d = 0; d < days; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - 1 - d));
      
      // Saltar fines de semana (mercados no publican)
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue;
      
      // Saltar si ya existe esa fecha + producto (datos reales ya insertados)
      const exists = await client.query(
        "SELECT 1 FROM fuel_prices WHERE product=$1 AND \"priceDate\"=$2 AND source!='cb_market_hist' LIMIT 1",
        [product, date.toISOString().split('T')[0]]
      );
      if (exists.rows.length > 0) continue;
      
      const priceUsd = series[d];
      const priceEur = priceUsd * EUR_RATE;
      
      await client.query(
        `INSERT INTO fuel_prices (id, product, region, country, "priceUsd", "priceEur", unit, source, "priceDate", "createdAt")
         VALUES (gen_random_uuid(), $1, 'europe', 'EU', $2, $3, 'metric_ton', 'cb_market_hist', $4, NOW())`,
        [product, priceUsd.toFixed(4), priceEur.toFixed(4), date.toISOString().split('T')[0]]
      );
      inserted++;
    }
  }
  
  console.log(`Inserted ${inserted} historical records`);
  
  // Verificar
  const count = await client.query("SELECT COUNT(*) FROM fuel_prices");
  const range = await client.query('SELECT MIN("priceDate") as min, MAX("priceDate") as max, COUNT(DISTINCT "priceDate") as days FROM fuel_prices');
  console.log('Total fuel_prices:', count.rows[0].count);
  console.log('Date range:', JSON.stringify(range.rows[0]));
  
  await client.end();
}

seed().catch(e => { console.error(e.message); process.exit(1); });
