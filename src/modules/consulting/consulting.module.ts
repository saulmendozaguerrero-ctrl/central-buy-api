import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConsultingController } from './consulting.controller';
import { PricesService } from '../../services/prices.service';

@Module({
  imports: [HttpModule],
  controllers: [ConsultingController],
  providers: [PricesService],
  exports: [PricesService],
})
export class ConsultingModule {}
