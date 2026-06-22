import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { ReportsController } from './reports.controller';

@Module({
  providers: [PdfService],
  controllers: [ReportsController],
  exports: [PdfService],
})
export class ReportsModule {}
