import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface FuelSavingsReport {
  userId: string;
  userName: string;
  reportDate: Date;
  totalRoutes: number;
  totalDistance: number;
  totalSavings: number;
  averageSavingsPercent: number;
  routes: Array<{
    origin: string;
    destination: string;
    distance: number;
    savings: number;
    savingsPercent: number;
    date: string;
  }>;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly config: ConfigService) {}

  async generateFuelSavingsReport(report: FuelSavingsReport): Promise<Buffer> {
    try {
      // Generate HTML report
      const html = this.generateFuelSavingsHTML(report);

      // TODO: Use html-pdf or pdfkit to convert HTML to PDF
      // For MVP, return mock PDF buffer with HTML inside
      const mockPdfBuffer = Buffer.from(`
        PDF Report - Fuel Savings
        Generated: ${new Date().toISOString()}
        
        ${html.replace(/<[^>]*>/g, '')}
      `);

      this.logger.log(`[PDF] Generated fuel savings report for user ${report.userId}`);
      return mockPdfBuffer;
    } catch (error) {
      this.logger.error(`[PDF] Failed to generate report: ${error.message}`);
      throw error;
    }
  }

  async generateSubscriptionInvoice(
    subscriptionId: string,
    userEmail: string,
    plan: string,
    amount: number,
    period: { from: Date; to: Date },
  ): Promise<Buffer> {
    try {
      const html = this.generateInvoiceHTML({
        subscriptionId,
        userEmail,
        plan,
        amount,
        period,
      });

      const mockPdfBuffer = Buffer.from(`
        INVOICE
        
        Subscription ID: ${subscriptionId}
        Email: ${userEmail}
        Plan: ${plan}
        Amount: €${(amount / 100).toFixed(2)}
        Period: ${period.from.toISOString().split('T')[0]} to ${period.to.toISOString().split('T')[0]}
        
        Thank you for your subscription!
      `);

      this.logger.log(`[PDF] Generated invoice for subscription ${subscriptionId}`);
      return mockPdfBuffer;
    } catch (error) {
      this.logger.error(`[PDF] Failed to generate invoice: ${error.message}`);
      throw error;
    }
  }

  private generateFuelSavingsHTML(report: FuelSavingsReport): string {
    const routesHTML = report.routes
      .map(
        (r) => `
      <tr>
        <td>${r.origin}</td>
        <td>${r.destination}</td>
        <td>${r.distance} km</td>
        <td>€${r.savings.toFixed(2)}</td>
        <td>${r.savingsPercent.toFixed(1)}%</td>
        <td>${r.date}</td>
      </tr>
    `,
      )
      .join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2C3277; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .summary { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Fuel Savings Report</h1>
          <p>User: ${report.userName}</p>
          <p>Generated: ${report.reportDate.toISOString().split('T')[0]}</p>
          
          <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Routes:</strong> ${report.totalRoutes}</p>
            <p><strong>Total Distance:</strong> ${report.totalDistance} km</p>
            <p><strong>Total Savings:</strong> €${report.totalSavings.toFixed(2)}</p>
            <p><strong>Average Savings:</strong> ${report.averageSavingsPercent.toFixed(1)}%</p>
          </div>
          
          <h2>Routes</h2>
          <table>
            <thead>
              <tr>
                <th>Origin</th>
                <th>Destination</th>
                <th>Distance</th>
                <th>Savings</th>
                <th>Percentage</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${routesHTML}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  private generateInvoiceHTML(invoice: {
    subscriptionId: string;
    userEmail: string;
    plan: string;
    amount: number;
    period: { from: Date; to: Date };
  }): string {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .company-name { font-size: 24px; font-weight: bold; color: #2C3277; }
            table { width: 100%; border-collapse: collapse; margin-top: 40px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .total { font-weight: bold; font-size: 16px; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">CENTRAL BUY</div>
            <p>Fuel Intelligence Platform</p>
          </div>
          
          <h2>Invoice</h2>
          <table>
            <tr>
              <td><strong>Subscription ID:</strong></td>
              <td>${invoice.subscriptionId}</td>
            </tr>
            <tr>
              <td><strong>Customer Email:</strong></td>
              <td>${invoice.userEmail}</td>
            </tr>
            <tr>
              <td><strong>Plan:</strong></td>
              <td>${invoice.plan}</td>
            </tr>
            <tr>
              <td><strong>Billing Period:</strong></td>
              <td>${invoice.period.from.toISOString().split('T')[0]} to ${invoice.period.to.toISOString().split('T')[0]}</td>
            </tr>
            <tr class="total">
              <td><strong>Amount Due:</strong></td>
              <td>€${(invoice.amount / 100).toFixed(2)}</td>
            </tr>
          </table>
          
          <div class="footer">
            <p>Thank you for your subscription to CENTRAL BUY.</p>
            <p>For support, contact: support@centralbuy.com</p>
          </div>
        </body>
      </html>
    `;
  }
}
