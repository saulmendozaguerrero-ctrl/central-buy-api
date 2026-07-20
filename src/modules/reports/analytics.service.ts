import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { FuelPrice } from '../prices/entities/fuel-price.entity';
import { FuelLog } from '../fleet/entities/fuel-log.entity';
import { Vehicle } from '../fleet/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';

interface DayPrice {
  date: string;
  average: number;
  min: number;
  max: number;
  samples: number;
}

interface ConsumptionData {
  date: string;
  consumption: number; // liters
  cost: number; // EUR
  distance: number; // km
  efficiency: number; // km/l
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(FuelPrice)
    private fuelPriceRepo: Repository<FuelPrice>,
    @InjectRepository(FuelLog)
    private fuelLogRepo: Repository<FuelLog>,
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /**
   * Get historical fuel prices for a given period
   * @param userId User ID (for fleet context)
   * @param days Period in days (30, 60, 90)
   * @returns Daily price statistics
   */
  async getPricesHistory(userId: string, days: number = 30): Promise<any> {
    if (![30, 60, 90].includes(days)) {
      throw new BadRequestException('Days must be 30, 60, or 90');
    }

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    const sinceDateStr = sinceDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Fetch all fuel prices in the period
    const prices = await this.fuelPriceRepo.find({
      where: {
        createdAt: MoreThan(sinceDate),
      },
      order: { createdAt: 'ASC' },
    });

    if (prices.length === 0) {
      return {
        success: true,
        data: {
          period: `Last ${days} days`,
          startDate: sinceDate.toISOString(),
          endDate: new Date().toISOString(),
          dailyPrices: [],
          summary: {
            average: 0,
            min: 0,
            max: 0,
            trend: 'neutral',
          },
        },
      };
    }

    // Group by date and calculate statistics
    const dailyMap = new Map<string, number[]>();
    prices.forEach((p) => {
      const date = p.priceDate; // Already in YYYY-MM-DD format
      if (!dailyMap.has(date)) {
        dailyMap.set(date, []);
      }
      dailyMap.get(date)!.push(parseFloat(p.priceEur.toString()));
    });

    const dailyPrices: DayPrice[] = Array.from(dailyMap).map(([date, priceList]) => ({
      date,
      average: parseFloat((priceList.reduce((a, b) => a + b, 0) / priceList.length).toFixed(3)),
      min: parseFloat(Math.min(...priceList).toFixed(3)),
      max: parseFloat(Math.max(...priceList).toFixed(3)),
      samples: priceList.length,
    }));

    // Calculate trend
    const firstWeek = dailyPrices.slice(0, 7);
    const lastWeek = dailyPrices.slice(-7);
    const firstAvg =
      firstWeek.reduce((a, b) => a + b.average, 0) / Math.max(1, firstWeek.length);
    const lastAvg = lastWeek.reduce((a, b) => a + b.average, 0) / Math.max(1, lastWeek.length);
    const trend = lastAvg > firstAvg ? 'up' : lastAvg < firstAvg ? 'down' : 'stable';

    const allPrices = prices.map((p) => parseFloat(p.priceEur.toString()));
    const summary = {
      average: parseFloat((allPrices.reduce((a, b) => a + b, 0) / allPrices.length).toFixed(3)),
      min: parseFloat(Math.min(...allPrices).toFixed(3)),
      max: parseFloat(Math.max(...allPrices).toFixed(3)),
      trend,
    };

    return {
      success: true,
      data: {
        period: `Last ${days} days`,
        startDate: sinceDate.toISOString(),
        endDate: new Date().toISOString(),
        dailyPrices: dailyPrices.sort((a, b) => a.date.localeCompare(b.date)),
        summary,
      },
    };
  }

  /**
   * Get estimated fuel consumption based on fleet logs
   * @param userId User ID (vehicle owner)
   * @param days Period in days (30, 60, 90)
   * @returns Daily consumption data with costs
   */
  async getConsumptionAnalytics(userId: string, days: number = 30): Promise<any> {
    if (![30, 60, 90].includes(days)) {
      throw new BadRequestException('Days must be 30, 60, or 90');
    }

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // Get user's fuel logs directly (user as driver)
    const logs = await this.fuelLogRepo.find({
      where: {
        driverId: userId,
        loggedAt: MoreThan(sinceDate),
      },
      order: { loggedAt: 'ASC' },
    });

    if (logs.length === 0) {
      return {
        success: true,
        data: {
          period: `Last ${days} days`,
          vehicles: 0,
          consumptionData: [],
          summary: {
            totalConsumption: 0,
            totalDistance: 0,
            averageEfficiency: 0,
            estimatedCost: '€0.00',
            averageCostPerDay: '€0.00',
          },
        },
      };
    }

    // Count unique vehicles from logs
    const vehicleIds = new Set(logs.map((l) => l.vehicleId));

    // Group by date and aggregate
    const dailyMap = new Map<string, any>();
    logs.forEach((log) => {
      const date = log.loggedAt.toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          consumption: 0,
          distance: 0,
          logs: 0,
          costs: 0,
        });
      }
      const daily = dailyMap.get(date)!;
      daily.consumption += parseFloat(log.liters.toString()) || 0;
      daily.distance += log.odometerKm || 0;
      daily.logs += 1;
      daily.costs += parseFloat(log.costEur.toString()) || 0;
    });

    const consumptionData: ConsumptionData[] = Array.from(dailyMap).map(([date, data]) => ({
      date,
      consumption: parseFloat(data.consumption.toFixed(2)),
      cost: parseFloat(data.costs.toFixed(2)),
      distance: parseFloat(data.distance.toFixed(2)),
      efficiency: data.distance > 0 ? parseFloat((data.distance / data.consumption).toFixed(2)) : 0,
    }));

    const totalConsumption = parseFloat(
      logs.reduce((a, b) => a + parseFloat(b.liters.toString()), 0).toFixed(2),
    );
    const totalDistance = parseFloat(
      logs.reduce((a, b) => a + (b.odometerKm || 0), 0).toFixed(2),
    );
    const totalCost = parseFloat(
      logs.reduce((a, b) => a + parseFloat(b.costEur.toString()), 0).toFixed(2),
    );

    return {
      success: true,
      data: {
        period: `Last ${days} days`,
        vehicles: vehicleIds.size,
        consumptionData: consumptionData.sort((a, b) => a.date.localeCompare(b.date)),
        summary: {
          totalConsumption,
          totalDistance,
          averageEfficiency: totalConsumption > 0 ? parseFloat((totalDistance / totalConsumption).toFixed(2)) : 0,
          estimatedCost: `€${totalCost.toFixed(2)}`,
          averageCostPerDay: `€${(totalCost / (days || 1)).toFixed(2)}`,
          daysWithData: consumptionData.length,
        },
      },
    };
  }

  /**
   * Calculate ROI/Savings for using CENTRAL BUY
   * @param userId User ID
   * @returns ROI and savings metrics
   */
  async calculateSavings(userId: string): Promise<any> {
    // Last 30 days
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const logsMonth = await this.fuelLogRepo.find({
      where: {
        driverId: userId,
        loggedAt: MoreThan(monthAgo),
      },
    });

    // Last 90 days
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

    const logsQuarter = await this.fuelLogRepo.find({
      where: {
        driverId: userId,
        loggedAt: MoreThan(threeMonthsAgo),
      },
    });

    // Return default data if no logs
    if (logsMonth.length === 0 && logsQuarter.length === 0) {
      return {
        success: true,
        data: {
          estimatedSavings: '€0.00',
          savingsPercent: 0,
          lastMonth: {
            consumption: 0,
            cost: 0,
            savedWithPlatform: '€0.00',
          },
          lastThreeMonths: {
            consumption: 0,
            cost: 0,
            savedWithPlatform: '€0.00',
          },
          roi: '0%',
          roiMonths: 0,
        },
      };
    }

    // Mock CENTRAL BUY discount (typically 10-15%)
    const mockDiscount = 0.12; // 12% average discount from platform

    const consumptionMonth = logsMonth.reduce((a, b) => a + parseFloat(b.liters.toString()), 0);
    const costMonth = logsMonth.reduce(
      (a, b) => a + parseFloat(b.costEur.toString()),
      0,
    );
    const savedMonth = costMonth * mockDiscount;

    const consumptionQuarter = logsQuarter.reduce((a, b) => a + parseFloat(b.liters.toString()), 0);
    const costQuarter = logsQuarter.reduce(
      (a, b) => a + parseFloat(b.costEur.toString()),
      0,
    );
    const savedQuarter = costQuarter * mockDiscount;

    // Estimate annual savings
    const daysWithLogsMonth = new Set(logsMonth.map((l) => l.loggedAt.toISOString().split('T')[0])).size;
    const monthlyAverage = daysWithLogsMonth > 0 ? (costMonth / daysWithLogsMonth) * 30 : 0;
    const annualSavings = monthlyAverage * 12 * mockDiscount;

    // ROI: assuming CENTRAL BUY costs €9.99/month for empresa or €4.99/month for particular
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const monthlyCost = user?.planType === 'empresa' ? 9.99 : 4.99;
    const annualPlatformCost = monthlyCost * 12;
    const roi = annualSavings > 0 ? ((annualSavings - annualPlatformCost) / annualPlatformCost) * 100 : 0;
    const roiMonths = roi > 0 ? Math.ceil(annualPlatformCost / (annualSavings / 12)) : 999;

    return {
      success: true,
      data: {
        estimatedSavings: `€${annualSavings.toFixed(2)}`,
        savingsPercent: parseFloat((mockDiscount * 100).toFixed(1)),
        lastMonth: {
          consumption: parseFloat(consumptionMonth.toFixed(2)),
          cost: parseFloat(costMonth.toFixed(2)),
          savedWithPlatform: `€${savedMonth.toFixed(2)}`,
        },
        lastThreeMonths: {
          consumption: parseFloat(consumptionQuarter.toFixed(2)),
          cost: parseFloat(costQuarter.toFixed(2)),
          savedWithPlatform: `€${savedQuarter.toFixed(2)}`,
        },
        estimatedAnnualSavings: `€${annualSavings.toFixed(2)}`,
        platformCost: `€${monthlyCost.toFixed(2)}/month`,
        roi: `${roi.toFixed(1)}%`,
        roiMonths: roiMonths < 999 ? roiMonths : null,
        note: 'Savings based on mock CENTRAL BUY discount rates. Real savings depend on platform pricing.',
      },
    };
  }
}
