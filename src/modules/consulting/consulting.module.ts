import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConsultingController } from './consulting.controller';
import { MarketDataService } from '../../services/market-data.service';

@Module({
  imports: [HttpModule],
  controllers: [ConsultingController],
  providers: [MarketDataService],
  exports: [MarketDataService],
})
export class ConsultingModule {}
