const { Client } = require('pg');
const client = new Client({ 
  connectionString: 'postgresql://postgres:mBBAXwUbPpaCxhFqZkeqXjkcpfbqrUbw@acela.proxy.rlwy.net:47273/railway', 
  ssl: { rejectUnauthorized: false } 
});

const PILLS = [
  {
    slug: 'anticipacion-frenado-progresivo',
    title: 'Anticipación y frenado progresivo',
    excerpt: 'Cada vez que tocas el freno, conviertes energía cinética en calor. Aprende a leer el tráfico para no frenar.',
    category: 'eco-driving',
    durationMin: 4,
    difficulty: 'beginner',
    accessLevel: 'empresa',
    content: JSON.stringify({
      hook: '¿Sabías que el 30% del consumo extra viene de frenadas innecesarias? La energía cinética que cuesta combustible acumular, se pierde en calor cada vez que pisas el freno.',
      theory: [
        'La anticipación es la técnica más eficiente del eco-driving. Consiste en levantar el pie del acelerador antes de llegar a un obstáculo, usando la desaceleración natural del motor.',
        'Un conductor que anticipa reduce su consumo entre un 15% y un 25% sin alterar su tiempo de llegada.',
        'La distancia ideal de anticipación en ciudad es 3-4 segundos de tiempo de reacción. En carretera, mínimo 4 segundos.',
      ],
      tips: [
        'Observa el estado del semáforo a 200m. Si está en verde y llevas tiempo, es probable que cambie.',
        'En autopista, crea un "colchón" de 3-4 segundos con el vehículo de delante.',
        'Cuando veas un obstáculo, levanta el pie antes de pensar en frenar.',
        'El frenado motor (sin embrague) desactiva la inyección en muchos vehículos modernos = 0 consumo.',
      ],
      quiz: [
        { q: '¿Cuánto consumo extra genera el frenado innecesario?', a: 'Hasta un 30% del consumo total', options: ['5-10%', '10-15%', 'Hasta un 30%', 'Menos del 5%'] },
        { q: '¿Qué ocurre con la inyección durante el frenado motor?', a: 'Se desactiva (0 consumo)', options: ['Aumenta', 'Se mantiene igual', 'Se desactiva (0 consumo)', 'Reduce un 50%'] },
      ],
      savingEstimate: '12-18%',
    }),
    published: true,
  },
  {
    slug: 'marchas-revoluciones-par-motor',
    title: 'Marchas, revoluciones y par motor',
    excerpt: 'Un motor "alegre" no es un motor eficiente. Aprende la zona verde de RPMs.',
    category: 'eco-driving',
    durationMin: 4,
    difficulty: 'beginner',
    accessLevel: 'empresa',
    content: JSON.stringify({
      hook: 'El 80% de conductores usa marchas demasiado cortas. Cada 1000 RPM de más equivale a llevar el aire acondicionado puesto constantemente.',
      theory: [
        'El par máximo de los motores modernos (especialmente diésel) está entre 1500 y 2500 RPM. Ese es el rango donde el motor trabaja más eficientemente.',
        'En gasolina, la "zona verde" está entre 1500-2000 RPM. En diésel, 1200-1800 RPM.',
        'Subir de marcha cuanto antes (sin que el motor "tire") puede reducir el consumo un 20%.',
      ],
      tips: [
        'En ciudad: segunda a 15 km/h, tercera a 25 km/h, cuarta a 40 km/h.',
        'En carretera: si puedes mantener 90 km/h en 6ª marcha sin tirones, úsala.',
        'No tengas miedo de usar marchas largas a bajas velocidades si el motor no tira.',
        'El indicador de "sube marcha" del cuadro es tu aliado — úsalo.',
      ],
      quiz: [
        { q: '¿Cuál es la zona eficiente de RPM en un motor diésel?', a: '1200-1800 RPM', options: ['800-1200 RPM', '1200-1800 RPM', '2000-3000 RPM', '3000-4000 RPM'] },
        { q: '¿A qué velocidad suele recomendarse meter 3ª en ciudad?', a: '25 km/h', options: ['15 km/h', '20 km/h', '25 km/h', '35 km/h'] },
      ],
      savingEstimate: '10-20%',
    }),
    published: true,
  },
  {
    slug: 'velocidad-constante-crucero',
    title: 'Velocidad constante y control de crucero',
    excerpt: 'Acelerar y desacelerar repetidamente puede multiplicar el consumo por 2. La velocidad constante es oro.',
    category: 'eco-driving',
    durationMin: 3,
    difficulty: 'beginner',
    accessLevel: 'empresa',
    content: JSON.stringify({
      hook: 'Las aceleraciones bruscas son el mayor enemigo del consumo. Pasar de 0 a 50 km/h en 5 segundos vs 15 segundos puede doblar el consumo en ese tramo.',
      theory: [
        'La resistencia aerodinámica crece con el cuadrado de la velocidad. A 120 km/h consumes el doble que a 90 km/h.',
        'El control de crucero en autopista puede reducir el consumo un 5-15% simplemente manteniendo velocidad constante.',
        'Cada subida de 10 km/h por encima de 90 incrementa el consumo aprox. un 10%.',
      ],
      tips: [
        'Usa el control de crucero siempre que sea posible en autopista.',
        'Mantén una velocidad constante en ciudad usando la anticipación.',
        'En pendientes ascendentes, anticipa y mantén velocidad. No esperes a perder velocidad para acelerar.',
        '120 km/h vs 110 km/h: 15% más de consumo. ¿Merece la pena llegar 3 minutos antes?',
      ],
      quiz: [
        { q: '¿Cuánto más consume a 120 vs 90 km/h aproximadamente?', a: 'Cerca del doble', options: ['Un 10% más', 'Un 30% más', 'Cerca del doble', 'Igual'] },
        { q: '¿Qué hace el control de crucero respecto al consumo en autopista?', a: 'Reduce 5-15% el consumo', options: ['No tiene efecto', 'Aumenta el consumo', 'Reduce 5-15% el consumo', 'Aumenta la velocidad'] },
      ],
      savingEstimate: '8-15%',
    }),
    published: true,
  },
  {
    slug: 'presion-neumaticos-eficiencia',
    title: 'Presión de neumáticos y resistencia a la rodadura',
    excerpt: '1 bar menos de presión = 3% más de consumo. Y el 80% de los vehículos circula con neumáticos bajos.',
    category: 'fleet-management',
    durationMin: 3,
    difficulty: 'beginner',
    accessLevel: 'empresa',
    content: JSON.stringify({
      hook: '1 bar de presión menos en cada rueda incrementa el consumo un 3% y aumenta el desgaste un 20%. El 80% de los vehículos circula inflado por debajo de lo recomendado.',
      theory: [
        'La resistencia a la rodadura representa el 20-30% del consumo total en ciudad.',
        'La presión recomendada se encuentra en la puerta del conductor o en el tapón del depósito.',
        'En vehículos cargados, se recomienda aumentar la presión trasera según las indicaciones del fabricante.',
      ],
      tips: [
        'Revisa la presión cada 2 semanas. Los neumáticos pierden aprox. 0.1 bar al mes.',
        'Infla siempre en frío (antes de rodar o después de 30 minutos parado).',
        'Considera neumáticos de bajo rodamiento (etiqueta energética A o B).',
        'En flota: implementa revisión semanal de presiones. ROI inmediato.',
      ],
      quiz: [
        { q: '¿Cuánto aumenta el consumo por cada bar menos de presión?', a: '3% por barra', options: ['1% por barra', '3% por barra', '5% por barra', '10% por barra'] },
        { q: '¿Cuándo se debe medir la presión de los neumáticos?', a: 'En frío (antes de rodar)', options: ['Justo después de rodar', 'En caliente', 'En frío (antes de rodar)', 'A cualquier temperatura'] },
      ],
      savingEstimate: '3-6%',
    }),
    published: true,
  },
  {
    slug: 'aerodinamica-cargas-adicionales',
    title: 'Aerodinámica: cargas, portaequipajes y peso',
    excerpt: 'Una baca vacía cuesta un 10% de consumo. Un vehículo con 200 kg extra, un 5% más.',
    category: 'fleet-management',
    durationMin: 3,
    difficulty: 'beginner',
    accessLevel: 'empresa',
    content: JSON.stringify({
      hook: 'Una baca portaequipajes vacía que nunca quitas te cuesta entre 0.5 y 1 litro extra cada 100 km. Al año: 150-200€ tirados.',
      theory: [
        'La resistencia aerodinámica (Cx) es el factor más importante a altas velocidades.',
        'Cada 100 kg de peso adicional incrementa el consumo aprox. un 5% en ciudad.',
        'Los portaequipajes de techo aumentan el Cx entre 20% y 40% incluso vacíos.',
      ],
      tips: [
        'Retira las bacas y portabicicletas cuando no los uses.',
        'Mantén el maletero limpio de peso innecesario.',
        'En flota: el peso de herramientas innecesarias suma. Audita el contenido de cada vehículo.',
        'Ventanillas: a más de 80 km/h, cierralas y usa ventilación interior.',
      ],
      quiz: [
        { q: '¿Cuánto consume extra una baca vacía a velocidades de autopista?', a: '10-15% más', options: ['1-2% más', '5% más', '10-15% más', 'No tiene efecto'] },
        { q: '¿Qué pasa con el consumo por cada 100 kg de peso extra?', a: 'Sube un 5%', options: ['Baja', 'No cambia', 'Sube un 5%', 'Sube un 15%'] },
      ],
      savingEstimate: '5-12%',
    }),
    published: true,
  },
  {
    slug: 'aire-acondicionado-consumo',
    title: 'Aire acondicionado: el ladrón silencioso',
    excerpt: 'El A/C puede elevar el consumo hasta un 25% en ciudad. Aprende a usarlo inteligentemente.',
    category: 'eco-driving',
    durationMin: 3,
    difficulty: 'intermediate',
    accessLevel: 'empresa',
    content: JSON.stringify({
      hook: 'En un atasco de verano con el A/C al máximo puedes estar consumiendo 2-3 litros extra cada 100 km solo por el compresor del aire.',
      theory: [
        'El A/C consume entre 1 y 3 kW de potencia del motor, lo que equivale a 0.5-1.5 L/100km de consumo extra.',
        'En ciudad, el impacto es mayor (hasta 25%) porque el motor trabaja a baja carga.',
        'En autopista a 120 km/h, ventanillas abiertas vs A/C: el A/C gana en aerodinámica.',
      ],
      tips: [
        'En ciudad: si la temperatura lo permite, ventilación natural antes de usar el A/C.',
        'Cuando arranques en día caluroso, ventila 2 min con ventanillas antes de encender el A/C.',
        'Programa el A/C 2-3°C por encima de la temperatura exterior (no luches contra la física).',
        'En autopista: A/C > ventanillas abiertas (aerodinámica). En ciudad: al revés.',
      ],
      quiz: [
        { q: '¿Cuánto puede aumentar el consumo el A/C en ciudad?', a: 'Hasta un 25%', options: ['5%', '10%', 'Hasta un 25%', '40%'] },
        { q: '¿En qué situación el A/C es más eficiente que las ventanillas?', a: 'En autopista a alta velocidad', options: ['En ciudad a baja velocidad', 'En autopista a alta velocidad', 'Siempre es lo mismo', 'Las ventanillas siempre son mejor'] },
      ],
      savingEstimate: '5-25%',
    }),
    published: true,
  },
  {
    slug: 'motor-caliente-arranques-cortos',
    title: 'Motor frío, arranques cortos y ralentí',
    excerpt: 'Los primeros 5 km son los más caros. El motor frío consume hasta el doble.',
    category: 'eco-driving',
    durationMin: 3,
    difficulty: 'beginner',
    accessLevel: 'empresa',
    content: JSON.stringify({
      hook: 'El motor frío consume entre 50% y 100% más que el motor a temperatura de trabajo. Y el ralentí en parado: 1-1.5 litros por hora tirados.',
      theory: [
        'Los primeros 5 km son los más costosos en consumo. La temperatura óptima de trabajo (80-90°C) no se alcanza hasta recorrer varios kilómetros.',
        'El ralentí en parado durante 10 minutos equivale a 0.2-0.3 litros de combustible.',
        'Los arranques frecuentes en rutas cortas son extraordinariamente ineficientes.',
      ],
      tips: [
        'No dejes el motor calentando en parado — es innecesario en vehículos modernos y desgasta.',
        'Arranca y comienza a circular suavemente. El movimiento calienta más rápido que el ralentí.',
        'En flota: optimiza rutas para evitar trayectos <5 km. Considera vehículos eléctricos para last-mile.',
        'Si paras más de 60 segundos: apaga el motor (el arranque gasta menos que 60s de ralentí).',
      ],
      quiz: [
        { q: '¿Cuánto más consume el motor frío respecto al motor caliente?', a: '50-100% más', options: ['5-10% más', '20-30% más', '50-100% más', 'Lo mismo'] },
        { q: '¿A partir de cuántos segundos parado es más eficiente apagar el motor?', a: '60 segundos', options: ['10 segundos', '30 segundos', '60 segundos', '3 minutos'] },
      ],
      savingEstimate: '8-15%',
    }),
    published: true,
  },
  {
    slug: 'planificacion-rutas-telematica',
    title: 'Planificación de rutas y telemática de flota',
    excerpt: 'La mejor maniobra de eco-driving es elegir la ruta correcta. La telemática lo hace automático.',
    category: 'fleet-management',
    durationMin: 5,
    difficulty: 'advanced',
    accessLevel: 'empresa',
    content: JSON.stringify({
      hook: 'Una ruta 15% más larga en kilómetros puede ser 20% más barata en combustible si evita atascos, cuestas y paradas. Los sistemas de telemática lo calculan automáticamente.',
      theory: [
        'El tráfico denso puede multiplicar por 3 el consumo en ciudad. Una ruta alternativa con 5 km más pero sin atascos puede ahorrar 2-3 litros.',
        'Los sistemas GPS con telemática integrada (cálculo eco-ruta) pueden reducir consumo un 10-20%.',
        'La consolidación de cargas (menos viajes, más llenos) es la mayor palanca de ahorro en flota.',
      ],
      tips: [
        'Planifica rutas con carga de ida Y vuelta (elimina viajes en vacío).',
        'Evita horas punta aunque la ruta sea más larga.',
        'Usa sistemas telemáticos con eco-scoring para incentivar buena conducción.',
        'Consolida entregas: 1 ruta con 10 paradas > 10 rutas con 1 parada.',
      ],
      quiz: [
        { q: '¿Cuánto puede multiplicar el consumo el tráfico denso en ciudad?', a: 'Hasta 3 veces', options: ['1.2 veces', '1.5 veces', 'Hasta 3 veces', '5 veces'] },
        { q: '¿Cuál es la mayor palanca de ahorro en flotas?', a: 'Consolidación de cargas', options: ['Conducción eficiente', 'Presión neumáticos', 'Consolidación de cargas', 'Tipo de combustible'] },
      ],
      savingEstimate: '10-20%',
    }),
    published: true,
  },
  {
    slug: 'conduccion-electrico-hibrido',
    title: 'Eco-driving en vehículos eléctricos e híbridos',
    excerpt: 'El eco-driving en eléctricos es diferente: la regeneración y la planificación de carga mandan.',
    category: 'eco-driving',
    durationMin: 4,
    difficulty: 'intermediate',
    accessLevel: 'empresa',
    content: JSON.stringify({
      hook: 'En un vehículo eléctrico, frenar con la regeneración puede recuperar hasta el 20% de la energía. Pero la climatización puede reducir la autonomía un 30%.',
      theory: [
        'La frenada regenerativa convierte energía cinética en electricidad. Maximizarla es clave.',
        'La climatización en eléctricos consume directamente de la batería (no del motor de combustión). En invierno puede reducir autonomía un 30-40%.',
        'Cargar a velocidades lentas (hasta 80% SOC) alarga la vida de la batería.',
      ],
      tips: [
        'Usa el modo "B" (o "L") para maximizar la frenada regenerativa en ciudad.',
        'Precalienta/pre-enfría el vehículo mientras está enchufado.',
        'Mantén la batería entre 20-80% para alargar su vida.',
        'Planifica cargas en los destinos, no solo en el origen.',
      ],
      quiz: [
        { q: '¿Cuánto puede recuperar la frenada regenerativa?', a: 'Hasta el 20% de energía', options: ['5% de energía', 'Hasta el 20% de energía', 'El 50% de energía', 'No recupera nada'] },
        { q: '¿Qué % de autonomía puede reducir la climatización en invierno?', a: '30-40%', options: ['5-10%', '15-20%', '30-40%', 'No tiene efecto'] },
      ],
      savingEstimate: '10-25%',
    }),
    published: true,
  },
  {
    slug: 'mantenimiento-preventivo-consumo',
    title: 'Mantenimiento preventivo e impacto en consumo',
    excerpt: 'Un filtro de aire sucio, aceite viejo o bujías desgastadas pueden costar 0.5 L/100km sin que lo notes.',
    category: 'fleet-management',
    durationMin: 4,
    difficulty: 'beginner',
    accessLevel: 'empresa',
    content: JSON.stringify({
      hook: 'Un motor mal mantenido puede consumir hasta un 10% más sin que el conductor lo perciba. La pérdida es gradual, silenciosa y acumulativa.',
      theory: [
        'El filtro de aire colmatado reduce el flujo de oxígeno al motor, forzando más combustible.',
        'El aceite degrado aumenta la fricción interna del motor (0.5-2% de consumo extra).',
        'Las bujías desgastadas (gasolina) o inyectores sucios (diésel) descomponen la mezcla aire-combustible.',
      ],
      tips: [
        'Cambia el filtro de aire cada 20.000 km o anualmente.',
        'Usa aceite de especificación exacta del fabricante (low viscosity si lo especifica).',
        'En flota: plan de mantenimiento predictivo = ahorro 3-8% consumo garantizado.',
        'Revisa el sistema de escape (EGR, DPF en diésel) cada 60.000 km.',
      ],
      quiz: [
        { q: '¿Cuánto consumo extra puede generar un mantenimiento deficiente?', a: 'Hasta un 10%', options: ['0.5%', '2%', 'Hasta un 10%', '20%'] },
        { q: '¿Con qué frecuencia se recomienda cambiar el filtro de aire?', a: '20.000 km o anual', options: ['5.000 km', '10.000 km', '20.000 km o anual', 'Solo cuando está visible sucio'] },
      ],
      savingEstimate: '3-10%',
    }),
    published: true,
  },
  {
    slug: 'combustible-calidad-aditivos',
    title: 'Calidad de combustible, aditivos y rentabilidad',
    excerpt: 'El diésel premium puede ser 10c/L más caro pero mejorar el consumo 3-5%. ¿Compensa?',
    category: 'emissions',
    durationMin: 4,
    difficulty: 'intermediate',
    accessLevel: 'empresa',
    content: JSON.stringify({
      hook: 'El sector habla de "combustible de calidad" como si fuera marketing. Pero los datos muestran que el diésel premium puede reducir el consumo un 3-5% en flotas. ¿Compensa el sobreprecio de 10c/L?',
      theory: [
        'Los combustibles premium tienen mayor índice de cetano (diésel) u octanaje (gasolina), lo que mejora la combustión.',
        'Los aditivos limpiadores mantienen inyectores y pistones libres de depósitos.',
        'En flotas con vehículos de alta exigencia (camiones, furgonetas >200.000 km), la diferencia es más pronunciada.',
      ],
      tips: [
        'Calcula: si el premium cuesta 5% más y ahorra 4% en consumo, con volumen alto = ROI positivo.',
        'En flotas jóvenes (<100.000 km), el combustible estándar de calidad contrastada es suficiente.',
        'Evita gasolineras "baratas" con alta rotación desconocida. BALLENOIL, Plenoil = calidad verificada + precio bajo.',
        'Usa aditivos limpiadores periódicamente (cada 30.000 km) si no usas premium.',
      ],
      quiz: [
        { q: '¿Cuánto puede mejorar el combustible premium el consumo en flotas?', a: '3-5%', options: ['0.5%', '1-2%', '3-5%', '10-15%'] },
        { q: '¿Para qué tipo de flota tiene más sentido el combustible premium?', a: 'Vehículos viejos con alto kilometraje', options: ['Flotas nuevas (<50.000 km)', 'Vehículos eléctricos', 'Vehículos viejos con alto kilometraje', 'No compensa en ningún caso'] },
      ],
      savingEstimate: '2-5%',
    }),
    published: true,
  },
  {
    slug: 'eco-score-kpis-flota',
    title: 'Eco-score, KPIs de flota y gestión por datos',
    excerpt: 'Lo que no se mide no se puede mejorar. Los 5 KPIs esenciales de eco-driving para gestores de flota.',
    category: 'fleet-management',
    durationMin: 5,
    difficulty: 'advanced',
    accessLevel: 'empresa',
    content: JSON.stringify({
      hook: 'El eco-score de CENTRAL BUY no es una nota arbitraria: es la síntesis de 5 comportamientos que representan el 80% del impacto en consumo.',
      theory: [
        'Los 5 KPIs de eco-driving: (1) frenadas bruscas/100km, (2) aceleraciones bruscas/100km, (3) % tiempo en zona verde RPM, (4) velocidad media en autopista, (5) consumo L/100km vs objetivo.',
        'Los conductores con eco-score >85 consumen de media un 18% menos que los de eco-score <70.',
        'El incentivo basado en eco-score reduce accidentes un 25% además de mejorar el consumo.',
      ],
      tips: [
        'Implementa un ranking mensual de eco-score visible para todos los conductores.',
        'Incentiva con bonus, días libres o reconocimiento público (no multas).',
        'Revisa los KPIs individualmente: un conductor con buen consumo pero muchas frenadas bruscas tiene riesgo de accidente.',
        'Objetivo inicial: que el 80% de conductores supere eco-score 75 en 3 meses.',
      ],
      quiz: [
        { q: '¿Cuánto menos consumen conductores con eco-score >85 vs <70?', a: 'Un 18% menos', options: ['5% menos', '10% menos', 'Un 18% menos', '30% menos'] },
        { q: '¿Qué adicional reduce un sistema de eco-scoring?', a: 'Los accidentes en un 25%', options: ['Nada', 'El mantenimiento un 50%', 'Los accidentes en un 25%', 'El seguro un 30%'] },
      ],
      savingEstimate: '15-20%',
    }),
    published: true,
  },
];

async function run() {
  await client.connect();
  
  let inserted = 0;
  for (const pill of PILLS) {
    await client.query(
      `INSERT INTO eco_pills (id, slug, title, excerpt, category, "durationMin", difficulty, "accessLevel", content, published, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [pill.slug, pill.title, pill.excerpt, pill.category, pill.durationMin, pill.difficulty, pill.accessLevel, pill.content, pill.published]
    );
    inserted++;
    console.log(`✓ ${pill.slug}`);
  }
  
  const count = await client.query('SELECT COUNT(*) as n FROM eco_pills');
  console.log(`\nTotal eco_pills: ${count.rows[0].n} (inserted/updated: ${inserted})`);
  await client.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
