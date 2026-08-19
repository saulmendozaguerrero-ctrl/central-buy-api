import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GovernmentStationsController } from './government-stations.controller';
import { GovernmentStationsService } from '../../services/government-stations.service';

@Module({
  imports: [HttpModule],
  controllers: [GovernmentStationsController],
  providers: [GovernmentStationsService],
  exports: [GovernmentStationsService],
})
export class GovernmentStationsModule {}
