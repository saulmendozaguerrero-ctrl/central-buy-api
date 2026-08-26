import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Platts price data extracted from Darioush Kanjouri's LinkedIn posts
 * Stores individual commodity prices from S&P Global Platts European Marketscan
 */

export enum PlattsCategory {
  CRUDE = 'crude',
  DIESEL = 'diesel',
  GASOLINE = 'gasoline',
  JET = 'jet',
  NAPHTHA = 'naphtha',
  FUEL_OIL = 'fueloil',
  MARINE_FUEL = 'marine_fuel',
  CARBON = 'carbon',
  SWAP = 'swap',
  BIOFUEL = 'biofuel',
}

export enum PlattsRegion {
  MEDITERRANEAN = 'mediterranean',
  NW_EUROPE = 'nw_europe',
  ROTTERDAM = 'rotterdam',
  WEST_AFRICA = 'west_africa',
  SINGAPORE = 'singapore',
  US_GULF = 'us_gulf',
  GLOBAL = 'global',
}

@Entity('platts_prices')
@Index(['priceDate', 'category', 'region'])
@Index(['priceDate'])
@Index(['productKey', 'priceDate'])
export class PlattsPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Date of the Platts report (YYYY-MM-DD) */
  @Column({ type: 'date' })
  priceDate: string;

  /** Commodity category (crude, diesel, gasoline, jet, naphtha, fueloil, etc.) */
  @Column({ type: 'enum', enum: PlattsCategory })
  category: PlattsCategory;

  /** Geographic region */
  @Column({ type: 'enum', enum: PlattsRegion })
  region: PlattsRegion;

  /** Unique product key (e.g. ulsd_10ppm_fob_nwe, brent_front_month) */
  @Column({ type: 'varchar', length: 100 })
  productKey: string;

  /** Human-readable product label */
  @Column({ type: 'varchar', length: 255 })
  productLabel: string;

  /** Price in USD */
  @Column({ type: 'decimal', precision: 12, scale: 4 })
  priceUsd: number;

  /** Price in EUR (computed using forex rate of the day) */
  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  priceEur: number;

  /** Price unit ($/mt, $/bbl, $/mtCO2e) */
  @Column({ type: 'varchar', length: 20, default: '$/mt' })
  unit: string;

  /** Day-over-day change in USD */
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  changeUsd: number;

  /** Day-over-day change in percent */
  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  changePct: number;

  /** Delivery/pricing type (FOB, CIF, Barge, Cargo, Futures, etc.) */
  @Column({ type: 'varchar', length: 30, nullable: true })
  deliveryType: string;

  /** Source (linkedin_scrape, manual, api) */
  @Column({ type: 'varchar', length: 30, default: 'linkedin_scrape' })
  source: string;

  /** LinkedIn post URL if scraped */
  @Column({ type: 'varchar', length: 500, nullable: true })
  sourceUrl: string;

  /** Raw text snippet from the post for audit */
  @Column({ type: 'text', nullable: true })
  rawSnippet: string;

  @CreateDateColumn()
  createdAt: Date;
}

/**
 * Stores the full Platts report snapshot for a given date
 * Including context (Rhine levels, refinery news, geopolitical, etc.)
 */
@Entity('platts_snapshots')
@Index(['reportDate'], { unique: true })
export class PlattsSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Report date (YYYY-MM-DD) */
  @Column({ type: 'date' })
  reportDate: string;

  /** Source publication (e.g. "S&P Global Platts European Marketscan") */
  @Column({ type: 'varchar', length: 255, default: 'Platts European Marketscan' })
  sourcePub: string;

  /** Volume/Issue if available */
  @Column({ type: 'varchar', length: 50, nullable: true })
  volumeIssue: string;

  /** EUR/USD forex rate for the day */
  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  eurUsd: number;

  /** GBP/USD forex rate */
  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  gbpUsd: number;

  /** Brent front-month futures ($/bbl) */
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  brentFrontMonth: number;

  /** Context JSON (Rhine level, refinery news, sanctions, etc.) */
  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, any>;

  /** Full parsed data JSON (complete snapshot) */
  @Column({ type: 'jsonb', nullable: true })
  fullData: Record<string, any>;

  /** LinkedIn post URL */
  @Column({ type: 'varchar', length: 500, nullable: true })
  linkedinPostUrl: string;

  /** Raw post text */
  @Column({ type: 'text', nullable: true })
  rawPostText: string;

  /** Processing status */
  @Column({ type: 'varchar', length: 20, default: 'processed' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
