import { Controller, Get, Param, Query, Res, Req } from '@nestjs/common';
import { Response } from 'express';
import { RatingReportService } from '../services/rating-report.service';

interface ReportResponse {
  name: string;
  totalParticipants: number;
  filledCount: number;
  approvedCount: number;
  revisionCount: number;
  pendingCount: number;
  averageScore: number;
  participants: {
    name: string;
    status: string;
    score: number;
    position?: string;
    scientificDegree?: string;
  }[];
}

@Controller('ratings/report')
export class RatingReportController {
  constructor(private readonly ratingReportService: RatingReportService) {}

  @Get(':ratingId')
  async getReport(
    @Param('ratingId') ratingId: number,
    @Query('groupBy') groupBy?: 'department' | 'unit' | 'position' | 'degree',
  ): Promise<ReportResponse[]> {
    return this.ratingReportService.generateReport(ratingId, groupBy);
  }

  @Get(':ratingId/pdf')
  async getPdfReport(
    @Res() res: Response,
    @Param('ratingId') ratingId: number,
    @Query('groupBy') groupBy?: 'department' | 'unit' | 'position' | 'degree',
  ): Promise<void> {
    const buffer = await this.ratingReportService.generatePdfReport(ratingId, groupBy);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="rating-report-${ratingId}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

}
