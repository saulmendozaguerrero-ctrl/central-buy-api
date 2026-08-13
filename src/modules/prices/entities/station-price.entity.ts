import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('station_prices')
@Index(['stationId'], { unique: true })
@Index(['province'])
@Index(['dieselPrice'])
@Index(['gasoline95Price'])
export class StationPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  stationId: string; // IDEESS from the Ministry API

  @Column({ type: 'varchar', length: 255 })
  name: string; // Rótulo

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string; // Dirección

  @Column({ type: 'varchar', length: 255, nullable: true })
  municipality: string; // Municipio

  @Column({ type: 'varchar', length: 255, nullable: true })
  province: string; // Provincia

  @Column({ type: 'varchar', length: 10, nullable: true })
  postalCode: string; // C.P.

  @Column({ type: 'float', nullable: true })
  lat: number; // Latitud

  @Column({ type: 'float', nullable: true })
  lng: number; // Longitud (WGS84)

  @Column({ type: 'varchar', length: 500, nullable: true })
  schedule: string; // Horario

  @Column({ type: 'float', nullable: true })
  dieselPrice: number; // Precio Gasoleo A

  @Column({ type: 'float', nullable: true })
  gasoline95Price: number; // Precio Gasolina 95 E5

  @Column({ type: 'float', nullable: true })
  gasoline98Price: number; // Precio Gasolina 98 E5

  @Column({ type: 'float', nullable: true })
  dieselPremiumPrice: number; // Precio Gasoleo Premium

  @Column({ type: 'varchar', length: 20, default: 'ministerio' })
  source: string;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
