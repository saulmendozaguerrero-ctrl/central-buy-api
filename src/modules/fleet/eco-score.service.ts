import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import dayjs from 'dayjs';
import { EcoScore } from './entities/eco-score.entity';
import { FuelLog } from './entities/fuel-log.entity';
import { Vehicle, VehicleType } from './entities/vehicle.entity';

// Optimal L/100km by vehicle type
const OPTIMAL_CONSUMPTION: Record<VehicleType, number> = {
  [VehicleType.CAR]: 7.0,
  [VehicleType.VAN]: 9.5,
  [VehicleType.TRUCK]: 28.0,
  [VehicleType.BUS]: 35.0,
  [VehicleType.MACHINERY]: 15.0,
  [VehicleType.BOAT]: 40.0,
  [VehicleType.OTHER]: 12.0,
};

const TIPS_BY_DEVIATION: Record<string, string[]> = {
  excellent: [
    'Excellent eco-driving! Keep maintaining steady speeds',
    'Consider route optimization to further reduce consumption',
  ],
  good: [
    'Good driving habits. Avoid sudden acceleration to improve further',
    'Check tire pressure monthly for optimal fuel efficiency',
  ],
  average: [
    'Reduce idling time — turn off engine when stopped for more than 1 minute',
    'Maintain a safe following distance to reduce braking and acceleration cycles',
    'Use cruise control on highways when possible',
  ],
  poor: [
    'Anticipate traffic to avoid harsh braking and acceleration',
    'Plan routes to avoid congested areas during peak hours',
    'Check vehicle maintenance: air filter, spark plugs, and tire pressure',
    'Consider driver training for fuel-efficient driving techniques',
  ],
};

@Injectable()
export class EcoScoreService {
  constructor(
    @InjectRepository(EcoScore)
    private readonly ecoScoreRepo: Repository<EcoScore>,
    @InjectRepository(FuelLog)
    private readonly fuelLogRepo: Repository<FuelLog>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) {}

  calculateScore(actualL100km: number, vehicleType: VehicleType): number {
    const optimal = OPTIMAL_CONSUMPTION[vehicleType] ?? 12;
    const deviation = ((actualL100km - optimal) / optimal) * 100;
    const score = Math.max(0, Math.min(100, Math.round(100 - deviation * 2)));
    return score;
  }

  getTips(score: number): string[] {
    if (score >= 85) return TIPS_BY_DEVIATION.excellent;
    if (score >= 70) return TIPS_BY_DEVIATION.good;
    if (score >= 50) return TIPS_BY_DEVIATION.average;
    return TIPS_BY_DEVIATION.poor;
  }

  async calculateAndSaveForDriver(
    driverId: string,
    orgId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<EcoScore> {
    const logs = await this.fuelLogRepo.find({
      where: {
        driverId,
        orgId,
        loggedAt: Between(periodStart, periodEnd) as any,
      },
      relations: { vehicle: true },
    });

    if (logs.length === 0) {
      const emptyScore = this.ecoScoreRepo.create({
        driverId,
        orgId,
        periodStart: dayjs(periodStart).format('YYYY-MM-DD'),
        periodEnd: dayjs(periodEnd).format('YYYY-MM-DD'),
        score: 0,
        totalLiters: 0,
        totalKm: 0,
        tips: ['No fuel logs recorded for this period'],
      });
      return this.ecoScoreRepo.save(emptyScore);
    }

    const totalLiters = logs.reduce((sum, l) => sum + Number(l.liters), 0);
    const odometerLogs = logs.filter((l) => l.odometerKm);
    const totalKm =
      odometerLogs.length >= 2
        ? Math.max(...odometerLogs.map((l) => l.odometerKm!)) -
          Math.min(...odometerLogs.map((l) => l.odometerKm!))
        : 0;

    const avgConsumption = totalKm > 0 ? (totalLiters / totalKm) * 100 : 0;

    const vehicleType = logs[0]?.vehicle?.type ?? VehicleType.OTHER;
    const score = totalKm > 0 ? this.calculateScore(avgConsumption, vehicleType) : 50;
    const tips = this.getTips(score);

    const existing = await this.ecoScoreRepo.findOne({
      where: {
        driverId,
        orgId,
        periodStart: dayjs(periodStart).format('YYYY-MM-DD'),
        periodEnd: dayjs(periodEnd).format('YYYY-MM-DD'),
      },
    });

    const ecoScore = existing ?? this.ecoScoreRepo.create({ driverId, orgId });
    ecoScore.periodStart = dayjs(periodStart).format('YYYY-MM-DD');
    ecoScore.periodEnd = dayjs(periodEnd).format('YYYY-MM-DD');
    ecoScore.score = score;
    ecoScore.avgConsumption = Math.round(avgConsumption * 100) / 100;
    ecoScore.totalKm = totalKm;
    ecoScore.totalLiters = Math.round(totalLiters * 100) / 100;
    ecoScore.tips = tips;

    return this.ecoScoreRepo.save(ecoScore);
  }
}
