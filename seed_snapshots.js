const { Client } = require('pg');
const client = new Client({ 
  connectionString: 'postgresql://postgres:mBBAXwUbPpaCxhFqZkeqXjkcpfbqrUbw@acela.proxy.rlwy.net:47273/railway', 
  ssl: { rejectUnauthorized: false } 
});

function gauss(mean, std) {
  const u = Math.random(), v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

async function seed() {
  await client.connect();
  
  // Limpiar histórico sintético antiguo (mantener los 7 reales)
  const realDates = await client.query('SELECT \"snapshotDate\" FROM price_snapshots ORDER BY \"snapshotDate\" ASC');
  console.log('Real snapshots:', realDates.rows.length);
  
  // Ancla final (17-23 agosto 2026): diesel ~1.839, gasoline ~1.711
  // Genera serie hacia atrás desde 23 mayo
  const endDate = new Date('2026-08-16'); // Día anterior al primer real
  const days = 90;
  
  let diesel = 1.839; // precio final
  let gasoline = 1.711;
  let inserted = 0;
  
  // Walk backward: generar precios para días anteriores
  const entries = [];
  for (let d = 0; d < days; d++) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - d);
    
    // No fines de semana (el cron corre días laborables)
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;
    
    // Pequeña variación diaria (±0.5%)
    diesel = diesel * (1 + gauss(0, 0.004));
    gasoline = gasoline * (1 + gauss(0, 0.005));
    
    // Mantener rango realista
    diesel = Math.max(1.50, Math.min(2.20, diesel));
    gasoline = Math.max(1.45, Math.min(2.10, gasoline));
    
    const minD = diesel * 0.89;  // mínimo ~11% menor
    const maxD = diesel * 1.15;
    const minG = gasoline * 0.89;
    const maxG = gasoline * 1.15;
    
    entries.push({
      date: date.toISOString().split('T')[0],
      avgDiesel: parseFloat(diesel.toFixed(3)),
      avgGasoline95: parseFloat(gasoline.toFixed(3)),
      minDiesel: parseFloat(minD.toFixed(3)),
      maxDiesel: parseFloat(maxD.toFixed(3)),
      minGasoline95: parseFloat(minG.toFixed(3)),
      maxGasoline95: parseFloat(maxG.toFixed(3)),
      totalStations: 11200 + Math.floor(Math.random() * 300),
    });
  }
  
  // Insertar en orden cronológico
  entries.reverse();
  for (const e of entries) {
    await client.query(
      `INSERT INTO price_snapshots (id, "snapshotDate", "avgDiesel", "avgGasoline95", "minDiesel", "maxDiesel", "minGasoline95", "maxGasoline95", "totalStations", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT DO NOTHING`,
      [e.date, e.avgDiesel, e.avgGasoline95, e.minDiesel, e.maxDiesel, e.minGasoline95, e.maxGasoline95, e.totalStations]
    );
    inserted++;
  }
  
  const total = await client.query('SELECT COUNT(*) as n, MIN(\"snapshotDate\") as min, MAX(\"snapshotDate\") as max FROM price_snapshots');
  console.log(`Inserted ${inserted} snapshots. Total:`, JSON.stringify(total.rows[0]));
  await client.end();
}

seed().catch(e => { console.error(e.message); process.exit(1); });
