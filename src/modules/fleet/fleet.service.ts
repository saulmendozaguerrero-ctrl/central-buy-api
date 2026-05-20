import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import dayjs from 'dayjs';
import { Vehicle } from './entities/vehicle.entity';
import { FuelLog } from './entities/fuel-log.entity';
import { EcoScore } from './entities/eco-score.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';

@Injectable()
export class FleetService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(FuelLog)
    private readonly fuelLogRepo: Repository<FuelLog>,
    @InjectRepository(EcoScore)
    private readonly ecoScoreRepo: Repository<EcoScore>,
  ) {}

  // ─── Vehicles ───────────────────────────────────────────────────────────────

  async getVehicles(orgId: string): Promise<Vehicle[]> {
    return this.vehicleRepo.find({
      where: { orgId, active: true },
      relations: { assignedDriver: true },
      order: { createdAt: 'DESC' },
    });
  }

  async createVehicle(orgId: string, dto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehicleRepo.create({ ...dto, orgId });
    return this.vehicleRepo.save(vehicle);
  }

  async updateVehicle(
    id: string,
    orgId: string,
    dto: Partial<CreateVehicleDto>,
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findOne({ where: { id, orgId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    Object.assign(vehicle, dto);
    return this.vehicleRepo.save(vehicle);
  }

  async deleteVehicle(id: string, orgId: string): Promise<void> {
    const vehicle = await this.vehicleRepo.findOne({ where: { id, orgId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    vehicle.active = false;
    await this.vehicleRepo.save(vehicle);
  }

  // ─── Fuel Logs ──────────────────────────────────────────────────────────────

  async createFuelLog(
    orgId: string,
    driverId: string,
    dto: CreateFuelLogDto,
  ): Promise<FuelLog> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: dto.vehicleId, orgId },
    });
    if (!vehicle) throw new ForbiddenException('Vehicle not found in your organization');

    const log = this.fuelLogRepo.create({
      ...dto,
      orgId,
      driverId,
      loggedAt: new Date(dto.loggedAt),
    });
    return this.fuelLogRepo.save(log);
  }

  async getFuelLogs(
    orgId: string,
    vehicleId?: string,
    from?: string,
    to?: string,
  ): Promise<FuelLog[]> {
    const where: any = { orgId };
    if (vehicleId) where.vehicleId = vehicleId;
    if (from && to) where.loggedAt = Between(new Date(from), new Date(to));

    return this.fuelLogRepo.find({
      where,
      relations: { vehicle: true, driver: true },
      order: { loggedAt: 'DESC' },
      take: 200,
    });
  }

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboard(orgId: string): Promise<{
    totalVehicles: number;
    totalSpendThisMonth: number;
    totalLitersThisMonth: number;
    avgCostPerLiter: number;
    topSpender: { driverId: string; totalCost: number } | null;
    recentLogs: FuelLog[];
  }> {
    const monthStart = dayjs().startOf('month').toDate();
    const monthEnd = dayjs().endOf('month').toDate();

    const [totalVehicles, monthLogs, recentLogs] = await Promise.all([
      this.vehicleRepo.count({ where: { orgId, active: true } }),
      this.fuelLogRepo.find({
        where: { orgId, loggedAt: Between(monthStart, monthEnd) as any },
      }),
      this.fuelLogRepo.find({
        where: { orgId },
        relations: { vehicle: true, driver: true },
        order: { loggedAt: 'DESC' },
        take: 10,
      }),
    ]);

    const totalSpend = monthLogs.reduce((s, l) => s + Number(l.costEur), 0);
    const totalLiters = monthLogs.reduce((s, l) => s + Number(l.liters), 0);

    // Top spender by driver
    const byDriver: Record<string, number> = {};
    for (const log of monthLogs) {
      byDriver[log.driverId] = (byDriver[log.driverId] ?? 0) + Number(log.costEur);
    }
    const topEntry = Object.entries(byDriver).sort((a, b) => b[1] - a[1])[0];

    return {
      totalVehicles,
      totalSpendThisMonth: Math.round(totalSpend * 100) / 100,
      totalLitersThisMonth: Math.round(totalLiters * 100) / 100,
      avgCostPerLiter:
        totalLiters > 0 ? Math.round((totalSpend / totalLiters) * 100) / 100 : 0,
      topSpender: topEntry ? { driverId: topEntry[0], totalCost: topEntry[1] } : null,
      recentLogs,
    };
  }

  // ─── Eco Scores ─────────────────────────────────────────────────────────────

  async getEcoScores(orgId: string): Promise<EcoScore[]> {
    return this.ecoScoreRepo.find({
      where: { orgId },
      relations: { driver: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getDriverEcoScore(driverId: string, orgId: string): Promise<EcoScore[]> {
    return this.ecoScoreRepo.find({
      where: { driverId, orgId },
      order: { periodStart: 'DESC' },
      take: 12,
    });
  }
}
