import { Controller, Get, Res, UseGuards, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { PdfService } from './pdf.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('fuel-savings/pdf')
  @ApiOperation({ summary: 'Download fuel savings report as PDF' })
  async downloadFuelSavingsReport(@CurrentUser() user: User, @Res() res: Response) {
    try {
      // TODO: Fetch actual fuel savings data from database
      const mockReport = {
        userId: user.id,
        userName: (user as any).firstName || user.id,
        reportDate: new Date(),
        totalRoutes: 5,
        totalDistance: 1300,
        totalSavings: 30.17,
        averageSavingsPercent: 9.9,
        routes: [
          {
            origin: 'Madrid',
            destination: 'Barcelona',
            distance: 627,
            savings: 10.22,
            savingsPercent: 9.8,
            date: '2026-06-15',
          },
          {
            origin: 'Barcelona',
            destination: 'Valencia',
            distance: 354,
            savings: 5.88,
            savingsPercent: 10.0,
            date: '2026-06-16',
          },
          {
            origin: 'Valencia',
            destination: 'Alicante',
            distance: 165,
            savings: 2.74,
            savingsPercent: 10.0,
            date: '2026-06-16',
          },
          {
            origin: 'Madrid',
            destination: 'Sevilla',
            distance: 544,
            savings: 9.04,
            savingsPercent: 10.0,
            date: '2026-06-17',
          },
          {
            origin: 'Sevilla',
            destination: 'Córdoba',
            distance: 138,
            savings: 2.29,
            savingsPercent: 10.0,
            date: '2026-06-17',
          },
        ],
      };

      const pdfBuffer = await this.pdfService.generateFuelSavingsReport(mockReport);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fuel-savings-report-${user.id}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate PDF report' });
    }
  }

  @Get('invoice/:subscriptionId/pdf')
  @ApiOperation({ summary: 'Download subscription invoice as PDF' })
  async downloadInvoice(
    @CurrentUser() user: User,
    @Param('subscriptionId') subscriptionId: string,
    @Res() res: Response,
  ) {
    try {
      // TODO: Verify user owns subscription
      const invoiceData = {
        subscriptionId,
        userEmail: (user as any).emailAddresses?.[0]?.emailAddress || user.id,
        plan: 'particular',
        amount: 499, // in cents (€4.99)
        period: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: new Date(),
        },
      };

      const pdfBuffer = await this.pdfService.generateSubscriptionInvoice(
        invoiceData.subscriptionId,
        invoiceData.userEmail,
        invoiceData.plan,
        invoiceData.amount,
        invoiceData.period,
      );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${subscriptionId}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate invoice' });
    }
  }
}
