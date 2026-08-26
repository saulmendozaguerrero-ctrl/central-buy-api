/**
 * Platts Data Parser
 * 
 * Parses Darioush Kanjouri's LinkedIn posts containing S&P Global Platts data.
 * Extracts commodity prices, spreads, forex, context info.
 * 
 * Post formats observed:
 * 1. Structured table format: "ULSD 10ppm FOB MED: $1,373.000/mt"
 * 2. Bullet-point format: "• Diesel CIF NWE — $1,321.50"
 * 3. Inline format: "Brent Sep $89.90/bbl"
 * 4. Change format: "$1,373 (+$15.25 / +1.12%)"
 */

import {
  PlattsCategory,
  PlattsRegion,
  PlattsPrice,
  PlattsSnapshot,
} from './entities/platts-price.entity';

export interface ParsedPlattsPrice {
  productKey: string;
  productLabel: string;
  category: PlattsCategory;
  region: PlattsRegion;
  priceUsd: number;
  priceEur?: number;
  unit: string;
  changeUsd?: number;
  changePct?: number;
  deliveryType?: string;
  rawSnippet?: string;
}

export interface ParsedPlattsSnapshot {
  reportDate: string;
  sourcePub: string;
  volumeIssue?: string;
  eurUsd?: number;
  gbpUsd?: number;
  brentFrontMonth?: number;
  context: Record<string, any>;
  prices: ParsedPlattsPrice[];
  rawPostText: string;
}

// ─── Price Extraction Patterns ────────────────────────────────────────────

/** Match dollar amounts: $1,373.000 or $89.90 or 1373.00 */
const PRICE_REGEX = /\$?\s*([\d,]+\.?\d*)/;

/** Match change in parens: (+$15.25 / +1.12%) or (-$5.00 / -0.38%) */
const CHANGE_REGEX = /\(([+-])\$?([\d,.]+)\s*\/?\s*([+-])?([\d,.]+)%?\)/;

/** Match simple percentage change: +1.12% or -0.38% */
const PCT_CHANGE_REGEX = /([+-])([\d,.]+)%/;

/** Match price with unit: $89.90/bbl or $1,373/mt */
const PRICE_UNIT_REGEX = /\$\s*([\d,]+\.?\d*)\s*\/\s*(bbl|mt|barrel|mtCO2e|gallon)/i;

// ─── Product Recognition ──────────────────────────────────────────────────

interface ProductPattern {
  patterns: RegExp[];
  key: string;
  label: string;
  category: PlattsCategory;
  region: PlattsRegion;
  unit: string;
  deliveryType?: string;
}

const PRODUCT_PATTERNS: ProductPattern[] = [
  // ── Crude ──
  { patterns: [/brent\s*(sep|oct|nov|dec|jan|feb|mar|apr|may|jun|jul|aug)\w*/i, /brent\s+front\s*month/i, /brent\s+futures/i],
    key: 'brent_front_month', label: 'Brent Front Month', category: PlattsCategory.CRUDE, region: PlattsRegion.GLOBAL, unit: '$/bbl' },
  { patterns: [/brent\s*(oct|nov|dec|jan|feb|mar|apr|may|jun|jul|aug|sep)\w*\s+(?:second|2nd)/i],
    key: 'brent_second_month', label: 'Brent Second Month', category: PlattsCategory.CRUDE, region: PlattsRegion.GLOBAL, unit: '$/bbl' },

  // ── Diesel / ULSD ──
  { patterns: [/ulsd\s*10\s*ppm\s*fob\s*med/i, /diesel\s*10ppm\s*fob\s*med/i],
    key: 'ulsd_10ppm_fob_med', label: 'ULSD 10ppm FOB MED', category: PlattsCategory.DIESEL, region: PlattsRegion.MEDITERRANEAN, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/ulsd\s*10\s*ppm\s*cif\s*med/i, /diesel\s*10ppm\s*cif\s*med/i],
    key: 'ulsd_10ppm_cif_med', label: 'ULSD 10ppm CIF MED', category: PlattsCategory.DIESEL, region: PlattsRegion.MEDITERRANEAN, unit: '$/mt', deliveryType: 'CIF' },
  { patterns: [/ulsd\s*10\s*ppm\s*fob\s*nwe/i, /diesel\s*10ppm\s*fob\s*nwe/i, /ulsd\s*10ppm\s*fob\s*(?:nw\s*europe)/i],
    key: 'ulsd_10ppm_fob_nwe', label: 'ULSD 10ppm FOB NWE', category: PlattsCategory.DIESEL, region: PlattsRegion.NW_EUROPE, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/ulsd\s*10\s*ppm\s*cif\s*nwe/i, /diesel\s*10ppm\s*cif\s*nwe/i],
    key: 'ulsd_10ppm_cif_nwe', label: 'ULSD 10ppm CIF NWE', category: PlattsCategory.DIESEL, region: PlattsRegion.NW_EUROPE, unit: '$/mt', deliveryType: 'CIF' },
  { patterns: [/diesel\s*10\s*ppm\s*(?:fob\s*)?(?:rotterdam|rdam)\s*barg/i, /diesel\s*(?:rotterdam|rdam)\s*barg/i],
    key: 'diesel_10ppm_fob_rotterdam', label: 'Diesel 10ppm FOB Rotterdam Barges', category: PlattsCategory.DIESEL, region: PlattsRegion.ROTTERDAM, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/gasoil\s*0\.?1\s*(?:%?\s*s?\s*)?fob\s*med/i],
    key: 'gasoil_01_fob_med', label: 'Gasoil 0.1% FOB MED', category: PlattsCategory.DIESEL, region: PlattsRegion.MEDITERRANEAN, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/gasoil\s*0\.?1\s*(?:%?\s*s?\s*)?fob\s*nwe/i],
    key: 'gasoil_01_fob_nwe', label: 'Gasoil 0.1% FOB NWE', category: PlattsCategory.DIESEL, region: PlattsRegion.NW_EUROPE, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/gasoil\s*0\.?1\s*(?:%?\s*s?\s*)?(?:fob\s*)?(?:rotterdam|rdam)/i],
    key: 'gasoil_01_fob_rotterdam', label: 'Gasoil 0.1% FOB Rotterdam', category: PlattsCategory.DIESEL, region: PlattsRegion.ROTTERDAM, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/diesel\s*ls\s*sts\s*lom[eé]/i, /diesel\s*(?:low\s*sulphur|ls)\s*(?:west\s*africa|lome)/i],
    key: 'diesel_ls_sts_lome', label: 'Diesel LS STS Lomé', category: PlattsCategory.DIESEL, region: PlattsRegion.WEST_AFRICA, unit: '$/mt', deliveryType: 'STS' },

  // ── Gasoline ──
  { patterns: [/prem(?:ium)?\s*unl(?:eaded)?\s*10\s*ppm\s*fob\s*med/i, /gasoline\s*10ppm\s*fob\s*med/i, /gasoline\s*prem\s*10ppm\s*fob\s*med/i],
    key: 'prem_unl_10ppm_fob_med', label: 'Premium Unleaded 10ppm FOB MED', category: PlattsCategory.GASOLINE, region: PlattsRegion.MEDITERRANEAN, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/gasoline\s*10\s*ppm\s*cif\s*nwe/i, /gasoline\s*cif\s*nwe/i],
    key: 'gasoline_10ppm_cif_nwe', label: 'Gasoline 10ppm CIF NWE', category: PlattsCategory.GASOLINE, region: PlattsRegion.NW_EUROPE, unit: '$/mt', deliveryType: 'CIF' },
  { patterns: [/eurobob\s*(?:oxy\s*)?fob\s*(?:rotterdam|rdam|ara)/i],
    key: 'eurobob_fob_rotterdam', label: 'Eurobob FOB Rotterdam', category: PlattsCategory.GASOLINE, region: PlattsRegion.ROTTERDAM, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/e10\s*eurobob\s*fob\s*(?:rotterdam|rdam)/i],
    key: 'e10_eurobob_fob_rotterdam', label: 'E10 Eurobob FOB Rotterdam', category: PlattsCategory.GASOLINE, region: PlattsRegion.ROTTERDAM, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/ron\s*98\s*(?:fob\s*)?(?:rotterdam|rdam)/i],
    key: 'ron98_fob_rotterdam', label: 'RON98 FOB Rotterdam', category: PlattsCategory.GASOLINE, region: PlattsRegion.ROTTERDAM, unit: '$/mt', deliveryType: 'FOB' },

  // ── Jet Fuel ──
  { patterns: [/jet\s*(?:fuel\s*)?fob\s*med/i, /jet\s*a-?1\s*fob\s*med/i],
    key: 'jet_fob_med', label: 'Jet Fuel FOB MED', category: PlattsCategory.JET, region: PlattsRegion.MEDITERRANEAN, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/jet\s*(?:fuel\s*)?fob\s*nwe/i],
    key: 'jet_fob_nwe', label: 'Jet Fuel FOB NWE', category: PlattsCategory.JET, region: PlattsRegion.NW_EUROPE, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/jet\s*(?:fuel\s*)?cif\s*nwe/i],
    key: 'jet_cif_nwe', label: 'Jet Fuel CIF NWE', category: PlattsCategory.JET, region: PlattsRegion.NW_EUROPE, unit: '$/mt', deliveryType: 'CIF' },
  { patterns: [/jet\s*(?:fuel\s*)?(?:fob\s*)?(?:rotterdam|rdam)/i],
    key: 'jet_fob_rotterdam', label: 'Jet Fuel FOB Rotterdam', category: PlattsCategory.JET, region: PlattsRegion.ROTTERDAM, unit: '$/mt', deliveryType: 'FOB' },

  // ── Naphtha ──
  { patterns: [/naphtha\s*fob\s*med/i],
    key: 'naphtha_fob_med', label: 'Naphtha FOB MED', category: PlattsCategory.NAPHTHA, region: PlattsRegion.MEDITERRANEAN, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/naphtha\s*cif\s*nwe/i],
    key: 'naphtha_cif_nwe', label: 'Naphtha CIF NWE', category: PlattsCategory.NAPHTHA, region: PlattsRegion.NW_EUROPE, unit: '$/mt', deliveryType: 'CIF' },
  { patterns: [/naphtha\s*physical\s*cif\s*nwe/i],
    key: 'naphtha_physical_cif_nwe', label: 'Naphtha Physical CIF NWE', category: PlattsCategory.NAPHTHA, region: PlattsRegion.NW_EUROPE, unit: '$/mt', deliveryType: 'CIF' },
  { patterns: [/naphtha\s*(?:fob\s*)?(?:rotterdam|rdam)/i],
    key: 'naphtha_fob_rotterdam', label: 'Naphtha FOB Rotterdam', category: PlattsCategory.NAPHTHA, region: PlattsRegion.ROTTERDAM, unit: '$/mt', deliveryType: 'FOB' },

  // ── Fuel Oil ──
  { patterns: [/f(?:uel\s*)?o(?:il)?\s*1\s*%?\s*(?:s?\s*)?fob\s*med/i],
    key: 'fo_1pct_fob_med', label: 'Fuel Oil 1% FOB MED', category: PlattsCategory.FUEL_OIL, region: PlattsRegion.MEDITERRANEAN, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/f(?:uel\s*)?o(?:il)?\s*3\.?5\s*%?\s*(?:s?\s*)?fob\s*med/i],
    key: 'fo_35pct_fob_med', label: 'Fuel Oil 3.5% FOB MED', category: PlattsCategory.FUEL_OIL, region: PlattsRegion.MEDITERRANEAN, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/f(?:uel\s*)?o(?:il)?\s*1\s*%?\s*(?:s?\s*)?fob\s*(?:rotterdam|rdam)/i],
    key: 'fo_1pct_fob_rotterdam', label: 'Fuel Oil 1% FOB Rotterdam', category: PlattsCategory.FUEL_OIL, region: PlattsRegion.ROTTERDAM, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/f(?:uel\s*)?o(?:il)?\s*3\.?5\s*%?\s*(?:s?\s*)?fob\s*(?:rotterdam|rdam)/i],
    key: 'fo_35pct_fob_rotterdam', label: 'Fuel Oil 3.5% FOB Rotterdam', category: PlattsCategory.FUEL_OIL, region: PlattsRegion.ROTTERDAM, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/bunker\s*380\s*cst\s*(?:fob\s*)?(?:rotterdam|rdam)/i],
    key: 'bunker_380cst_rotterdam', label: 'Bunker 380cst Rotterdam', category: PlattsCategory.FUEL_OIL, region: PlattsRegion.ROTTERDAM, unit: '$/mt', deliveryType: 'FOB' },

  // ── Marine Fuel ──
  { patterns: [/m(?:arine\s*)?f(?:uel)?\s*0\.?5\s*%?\s*(?:s?\s*)?fob\s*(?:rotterdam|rdam)/i, /vlsfo\s*(?:rotterdam|rdam)/i],
    key: 'mf_05pct_fob_rotterdam', label: 'Marine Fuel 0.5% FOB Rotterdam', category: PlattsCategory.MARINE_FUEL, region: PlattsRegion.ROTTERDAM, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/m(?:arine\s*)?f(?:uel)?\s*0\.?5\s*%?\s*(?:s?\s*)?fob\s*med/i],
    key: 'mf_05pct_fob_med', label: 'Marine Fuel 0.5% FOB MED', category: PlattsCategory.MARINE_FUEL, region: PlattsRegion.MEDITERRANEAN, unit: '$/mt', deliveryType: 'FOB' },
  { patterns: [/m(?:arine\s*)?f(?:uel)?\s*0\.?5\s*%?\s*(?:fob\s*)?singapore/i],
    key: 'mf_05pct_fob_singapore', label: 'Marine Fuel 0.5% FOB Singapore', category: PlattsCategory.MARINE_FUEL, region: PlattsRegion.SINGAPORE, unit: '$/mt', deliveryType: 'FOB' },

  // ── Carbon ──
  { patterns: [/carbon\s*(?:credit|price|eu\s*ets)/i, /eu\s*ets/i, /co2\s*(?:price|credit)/i],
    key: 'carbon_eu_ets', label: 'Carbon (EU ETS)', category: PlattsCategory.CARBON, region: PlattsRegion.GLOBAL, unit: '$/mtCO2e' },

  // ── Biofuels ──
  { patterns: [/bionaphtha\s*(?:cif\s*)?nwe/i],
    key: 'bionaphtha_cif_nwe', label: 'Bionaphtha CIF NWE', category: PlattsCategory.BIOFUEL, region: PlattsRegion.NW_EUROPE, unit: '$/mt', deliveryType: 'CIF' },
  { patterns: [/saf\s*(?:cif\s*)?nwe/i, /sustainable\s*aviation\s*fuel/i],
    key: 'saf_cif_nwe', label: 'SAF CIF NWE', category: PlattsCategory.BIOFUEL, region: PlattsRegion.NW_EUROPE, unit: '$/mt', deliveryType: 'CIF' },
];

// ─── Context Extraction Patterns ──────────────────────────────────────────

const CONTEXT_PATTERNS = {
  rhine_kaub: [
    /(?:rhine|rin)\s*(?:at\s*)?(?:kaub|level)[\s:]*(\d+)\s*cm/i,
    /kaub[\s:]*(\d+)\s*cm/i,
  ],
  eur_usd: [
    /eur\s*\/?\s*usd[\s:]*(\d+\.\d+)/i,
    /€\s*\/?\s*\$[\s:]*(\d+\.\d+)/i,
  ],
  gbp_usd: [
    /gbp\s*\/?\s*usd[\s:]*(\d+\.\d+)/i,
    /£\s*\/?\s*\$[\s:]*(\d+\.\d+)/i,
  ],
};

// ─── Utility Functions ────────────────────────────────────────────────────

function parseNumber(str: string): number | null {
  const cleaned = str.replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function extractDate(text: string): string | null {
  // Look for dates: "25 August 2026", "Aug 25, 2026", "2026-08-25", etc.
  const patterns = [
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{4})/i,
    /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})/i,
  ];

  const monthMap: Record<string, string> = {
    jan: '01', january: '01', feb: '02', february: '02',
    mar: '03', march: '03', apr: '04', april: '04',
    may: '05', jun: '06', june: '06', jul: '07', july: '07',
    aug: '08', august: '08', sep: '09', september: '09',
    oct: '10', october: '10', nov: '11', november: '11',
    dec: '12', december: '12',
  };

  // ISO format
  const isoMatch = text.match(patterns[0]);
  if (isoMatch) return isoMatch[0];

  // "25 August 2026"
  const dmyMatch = text.match(patterns[1]);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = monthMap[dmyMatch[2].toLowerCase().slice(0, 3)];
    return `${dmyMatch[3]}-${month}-${day}`;
  }

  // "August 25, 2026"
  const mdyMatch = text.match(patterns[2]);
  if (mdyMatch) {
    const day = mdyMatch[2].padStart(2, '0');
    const month = monthMap[mdyMatch[1].toLowerCase().slice(0, 3)];
    return `${mdyMatch[3]}-${month}-${day}`;
  }

  return null;
}

// ─── Main Parser ──────────────────────────────────────────────────────────

export class PlattsParser {
  /**
   * Parse a LinkedIn post text into structured Platts data.
   * Returns null if the post doesn't contain Platts data.
   */
  static parse(postText: string, postUrl?: string): ParsedPlattsSnapshot | null {
    if (!this.isPlattsPost(postText)) return null;

    const reportDate = extractDate(postText) || new Date().toISOString().split('T')[0];
    const prices: ParsedPlattsPrice[] = [];
    const context: Record<string, any> = {};

    // Split post into lines for line-by-line parsing
    const lines = postText.split(/\n/);

    // Extract prices
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 5) continue;

      for (const pattern of PRODUCT_PATTERNS) {
        let matched = false;
        for (const regex of pattern.patterns) {
          if (regex.test(trimmed)) {
            matched = true;
            break;
          }
        }

        if (matched) {
          // Extract price from the line
          const priceMatch = trimmed.match(PRICE_UNIT_REGEX) || trimmed.match(PRICE_REGEX);
          if (priceMatch) {
            const priceStr = priceMatch[1];
            const priceUsd = parseNumber(priceStr);
            if (priceUsd !== null && priceUsd > 0) {
              // Extract change if present
              let changeUsd: number | undefined;
              let changePct: number | undefined;
              const changeMatch = trimmed.match(CHANGE_REGEX);
              if (changeMatch) {
                const sign = changeMatch[1] === '-' ? -1 : 1;
                changeUsd = sign * (parseNumber(changeMatch[2]) || 0);
                changePct = (changeMatch[3] === '-' ? -1 : 1) * (parseNumber(changeMatch[4]) || 0);
              } else {
                const pctMatch = trimmed.match(PCT_CHANGE_REGEX);
                if (pctMatch) {
                  changePct = (pctMatch[1] === '-' ? -1 : 1) * (parseNumber(pctMatch[2]) || 0);
                }
              }

              // Avoid duplicates
              if (!prices.find(p => p.productKey === pattern.key)) {
                prices.push({
                  productKey: pattern.key,
                  productLabel: pattern.label,
                  category: pattern.category,
                  region: pattern.region,
                  priceUsd,
                  unit: pattern.unit,
                  changeUsd,
                  changePct,
                  deliveryType: pattern.deliveryType,
                  rawSnippet: trimmed,
                });
              }
            }
          }
          break;
        }
      }
    }

    // Extract context
    for (const [key, patterns] of Object.entries(CONTEXT_PATTERNS)) {
      for (const regex of patterns) {
        const match = postText.match(regex);
        if (match) {
          const value = parseNumber(match[1]);
          if (value !== null) context[key] = value;
          break;
        }
      }
    }

    // Extract Brent from context
    const brentPrice = prices.find(p => p.productKey === 'brent_front_month');
    const eurUsd = context['eur_usd'] as number | undefined;

    // Compute EUR prices if forex available
    if (eurUsd && eurUsd > 0) {
      for (const price of prices) {
        price.priceEur = Math.round(price.priceUsd / eurUsd * 10000) / 10000;
      }
    }

    // Extract geopolitical / refinery context from text
    const contextKeywords = [
      { pattern: /jazan\s*refinery/i, key: 'jazan_refinery' },
      { pattern: /hormuz/i, key: 'hormuz_tensions' },
      { pattern: /iran/i, key: 'iran_situation' },
      { pattern: /russia(?:n)?\s*(?:export|refin|ban|sanction)/i, key: 'russia_exports' },
      { pattern: /ukraine/i, key: 'ukraine_situation' },
      { pattern: /neste\s*(?:rotterdam|maintenance)/i, key: 'neste_maintenance' },
      { pattern: /maintenance|turnaround/i, key: 'refinery_maintenance' },
      { pattern: /inventory|stock|storage/i, key: 'inventory_note' },
    ];

    for (const { pattern, key } of contextKeywords) {
      const match = postText.match(pattern);
      if (match) {
        // Get surrounding context (±100 chars around match)
        const idx = postText.indexOf(match[0]);
        const start = Math.max(0, idx - 100);
        const end = Math.min(postText.length, idx + match[0].length + 100);
        context[key] = postText.slice(start, end).replace(/\n/g, ' ').trim();
      }
    }

    if (prices.length === 0) return null;

    return {
      reportDate,
      sourcePub: 'S&P Global Platts European Marketscan',
      eurUsd: eurUsd,
      gbpUsd: context['gbp_usd'] as number | undefined,
      brentFrontMonth: brentPrice?.priceUsd,
      context,
      prices,
      rawPostText: postText,
    };
  }

  /**
   * Quick check if a post likely contains Platts data
   */
  static isPlattsPost(text: string): boolean {
    const lowerText = text.toLowerCase();
    const plattsIndicators = [
      'platts',
      'european marketscan',
      'emarketscan',
      'ulsd',
      'fob med',
      'cif nwe',
      'eurobob',
      'fob rotterdam',
      'brent',
      '$/mt',
      '$/bbl',
      'gasoil',
      'naphtha',
    ];

    let score = 0;
    for (const indicator of plattsIndicators) {
      if (lowerText.includes(indicator)) score++;
    }

    // Need at least 2 indicators to consider it a Platts post
    return score >= 2;
  }

  /**
   * Parse a JSON object (from data/platts/*.json) into the standard format
   * For historical data already stored in JSON format
   */
  static parseJsonSnapshot(data: Record<string, any>): ParsedPlattsSnapshot | null {
    const reportDate = data.date;
    if (!reportDate) return null;

    const prices: ParsedPlattsPrice[] = [];
    const context = data.context || {};
    const eurUsd = data.forex?.eur_usd;

    // Parse crude
    if (data.crude) {
      for (const [key, val] of Object.entries(data.crude)) {
        const v = val as any;
        if (v?.price) {
          prices.push({
            productKey: key, productLabel: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            category: PlattsCategory.CRUDE, region: PlattsRegion.GLOBAL,
            priceUsd: v.price, unit: v.unit || '$/bbl', deliveryType: 'Futures',
          });
        }
      }
    }

    // Parse categories
    const categoryMap: Record<string, PlattsCategory> = {
      diesel: PlattsCategory.DIESEL, gasoline: PlattsCategory.GASOLINE,
      jet: PlattsCategory.JET, naphtha: PlattsCategory.NAPHTHA,
      fueloil: PlattsCategory.FUEL_OIL, marine_fuel: PlattsCategory.MARINE_FUEL,
    };

    for (const [catKey, catEnum] of Object.entries(categoryMap)) {
      const catData = data[catKey];
      if (!catData) continue;

      for (const [key, val] of Object.entries(catData)) {
        const v = val as any;
        const price = v?.price ?? v?.fob ?? v?.cif;
        if (price && typeof price === 'number') {
          const region = this.inferRegionFromKey(key);
          const deliveryType = this.inferDeliveryFromKey(key);
          const eurPrice = eurUsd && eurUsd > 0 ? Math.round(price / eurUsd * 10000) / 10000 : undefined;
          prices.push({
            productKey: key,
            productLabel: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            category: catEnum,
            region,
            priceUsd: price,
            priceEur: eurPrice,
            unit: v?.unit || '$/mt',
            deliveryType,
          });
        }
      }
    }

    // Also parse named region blocks (mediterranean, nwe, etc.)
    const regionBlocks: Record<string, PlattsRegion> = {
      mediterranean: PlattsRegion.MEDITERRANEAN,
      nwe: PlattsRegion.NW_EUROPE,
      west_africa_lome: PlattsRegion.WEST_AFRICA,
    };

    for (const [blockKey, blockRegion] of Object.entries(regionBlocks)) {
      const blockData = data[blockKey];
      if (!blockData || typeof blockData !== 'object') continue;

      for (const [key, val] of Object.entries(blockData)) {
        const v = val as any;
        const price = v?.price ?? v?.fob ?? v?.cif;
        if (price && typeof price === 'number' && !prices.find(p => p.productKey === `${blockKey}_${key}`)) {
          const cat = this.inferCategoryFromKey(key);
          const deliveryType = this.inferDeliveryFromKey(key);
          prices.push({
            productKey: `${blockKey}_${key}`,
            productLabel: `${key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} (${blockKey})`,
            category: cat,
            region: blockRegion,
            priceUsd: price,
            priceEur: eurUsd ? Math.round(price / eurUsd * 10000) / 10000 : undefined,
            unit: v?.unit || '$/mt',
            deliveryType,
          });
        }
      }
    }

    return {
      reportDate,
      sourcePub: data.source || 'Platts European Marketscan',
      volumeIssue: data.volume && data.issue ? `Vol.${data.volume} Issue ${data.issue}` : undefined,
      eurUsd,
      gbpUsd: data.forex?.gbp_usd,
      brentFrontMonth: data.brent?.futures_sep ?? data.crude?.brent_sep?.price,
      context,
      prices,
      rawPostText: JSON.stringify(data),
    };
  }

  private static inferRegionFromKey(key: string): PlattsRegion {
    const k = key.toLowerCase();
    if (k.includes('med')) return PlattsRegion.MEDITERRANEAN;
    if (k.includes('nwe') || k.includes('nw_europe')) return PlattsRegion.NW_EUROPE;
    if (k.includes('rotterdam') || k.includes('rdam') || k.includes('ara')) return PlattsRegion.ROTTERDAM;
    if (k.includes('lome') || k.includes('west_africa') || k.includes('waf')) return PlattsRegion.WEST_AFRICA;
    if (k.includes('singapore') || k.includes('sing')) return PlattsRegion.SINGAPORE;
    if (k.includes('usgc') || k.includes('us_gulf')) return PlattsRegion.US_GULF;
    return PlattsRegion.GLOBAL;
  }

  private static inferDeliveryFromKey(key: string): string {
    const k = key.toLowerCase();
    if (k.includes('fob')) return 'FOB';
    if (k.includes('cif')) return 'CIF';
    if (k.includes('barge')) return 'Barge';
    if (k.includes('cargo')) return 'Cargo';
    if (k.includes('sts')) return 'STS';
    if (k.includes('futures') || k.includes('swap')) return 'Futures';
    return 'Spot';
  }

  private static inferCategoryFromKey(key: string): PlattsCategory {
    const k = key.toLowerCase();
    if (k.includes('naphtha') || k.includes('bionaphtha')) return PlattsCategory.NAPHTHA;
    if (k.includes('diesel') || k.includes('ulsd') || k.includes('gasoil')) return PlattsCategory.DIESEL;
    if (k.includes('gasoline') || k.includes('eurobob') || k.includes('ron')) return PlattsCategory.GASOLINE;
    if (k.includes('jet') || k.includes('saf')) return PlattsCategory.JET;
    if (k.includes('fuel_oil') || k.includes('bunker') || k.includes('fo_')) return PlattsCategory.FUEL_OIL;
    if (k.includes('marine') || k.includes('vlsfo') || k.includes('mf_')) return PlattsCategory.MARINE_FUEL;
    if (k.includes('carbon') || k.includes('co2') || k.includes('ets')) return PlattsCategory.CARBON;
    if (k.includes('bio') || k.includes('saf')) return PlattsCategory.BIOFUEL;
    return PlattsCategory.DIESEL; // default
  }
}