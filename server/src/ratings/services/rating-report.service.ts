import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RatingParticipant, RatingParticipantStatus } from 'src/entities/rating-participant.entity';
import { Position } from 'src/entities/user.entity';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export interface ReportGroup {
  name: string;
  totalParticipants: number;
  filledCount: number;
  approvedCount: number;
  revisionCount: number;
  pendingCount: number;
  averageScore: number;
  participants: {
    name: string;
    status: RatingParticipantStatus;
    score: number;
    position?: string;
    degree?: string;
  }[];
}

export type GroupByType = 'department' | 'unit' | 'position' | 'scientificDegree';

@Injectable()
export class RatingReportService {
  private fontPath: string;

  constructor(
    @InjectRepository(RatingParticipant)
    private ratingParticipantRepository: Repository<RatingParticipant>,
  ) {
    this.fontPath = path.join(__dirname, '../../../assets/fonts/DejaVuSans.ttf');
  }

  async generateReport(ratingId: number, groupBy?: GroupByType) {
    // Змінено відношення, додано department.unit у зв'язки
    const participants = await this.ratingParticipantRepository.find({
      where: { rating: { id: ratingId } },
      relations: [
        'respondent',
        'respondent.department',
        'respondent.department.unit', // Правильний шлях до unit через department
        'responses',
        'rating',
        'rating.items',
      ],
    });

    const groups: Map<string, ReportGroup> = new Map();

    for (const participant of participants) {
      let groupKey = '';
      let groupName = '';

      switch (groupBy) {
        case 'department':
          groupKey = participant.respondent.department?.id.toString() || 'no_department';
          groupName = participant.respondent.department?.name || 'Без кафедри';
          break;
        case 'unit':
          // Виправлена логіка для доступу до unit через department
          groupKey = participant.respondent.department?.unit?.id.toString() || 'no_unit';
          groupName = participant.respondent.department?.unit?.name || 'Без підрозділу';
          break;
        case 'position':
          groupKey = participant.respondent.position || 'no_position';
          groupName = this.getPositionText(participant.respondent.position) || 'Без посади';
          break;
        case 'scientificDegree':
          groupKey = participant.respondent.degree || 'no_degree';
          groupName = participant.respondent.degree || 'Без наукового ступеня';
          break;
        default:
          groupKey = 'all';
          groupName = 'Загальний звіт';
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          name: groupName,
          totalParticipants: 0,
          filledCount: 0,
          approvedCount: 0,
          revisionCount: 0,
          pendingCount: 0,
          averageScore: 0,
          participants: [],
        });
      }

      const group = groups.get(groupKey)!;
      group.totalParticipants++;

      // Calculate total score for the participant
      let totalScore = 0;
      if (participant.status === RatingParticipantStatus.APPROVED && participant.responses?.[0]?.scores) {
        const scores = participant.responses[0].scores;
        totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      }

      // Update status counts
      switch (participant.status) {
        case RatingParticipantStatus.FILLED:
          group.filledCount++;
          break;
        case RatingParticipantStatus.APPROVED:
          group.approvedCount++;
          break;
        case RatingParticipantStatus.REVISION:
          group.revisionCount++;
          break;
        case RatingParticipantStatus.PENDING:
          group.pendingCount++;
          break;
      }

      group.participants.push({
        name: `${participant.respondent.lastName} ${participant.respondent.firstName}`,
        status: participant.status,
        score: totalScore,
        position: this.getPositionText(participant.respondent.position),
        degree: participant.respondent.degree,
      });

      // Update average score - запобігаємо діленню на нуль
      if (group.totalParticipants > 0) {
        group.averageScore = group.participants.reduce((sum, p) => sum + p.score, 0) / group.totalParticipants;
      } else {
        group.averageScore = 0;
      }
    }

    return Array.from(groups.values());
  }

  async generatePdfReport(ratingId: number, groupBy?: GroupByType): Promise<Buffer> {
    const report = await this.generateReport(ratingId, groupBy);
    const ratingParticipant = await this.ratingParticipantRepository
      .createQueryBuilder('participant')
      .leftJoinAndSelect('participant.rating', 'rating')
      .where('rating.id = :ratingId', { ratingId })
      .getOne();

    const doc = new PDFDocument({
      size: 'A4',
      bufferPages: true,
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: ratingParticipant?.rating.title || 'Звіт по рейтингу',
        Author: 'Rating System',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));

    const regularFontPath = path.join(__dirname, '../../../assets/fonts/DejaVuSans.ttf');
    const boldFontPath = path.join(__dirname, '../../../assets/fonts/DejaVuSans-Bold.ttf');

    try {
      if (fs.existsSync(regularFontPath)) {
        doc.registerFont('DejaVuSans', regularFontPath);
        doc.font('DejaVuSans');
      } else {
        throw new Error(`Шрифт DejaVuSans не знайдено за шляхом: ${regularFontPath}`);
      }
      if (fs.existsSync(boldFontPath)) {
        doc.registerFont('DejaVuSans-Bold', boldFontPath);
      }
    } catch (error) {
      console.error(error.message);
      doc.font('Helvetica');
    }

    // 🪪 Тип звіту для титульної сторінки
    const groupTitleMap: Record<GroupByType, string> = {
      department: 'Звіт по кафедрах',
      unit: 'Звіт по підрозділах',
      position: 'Звіт по посадах',
      scientificDegree: 'Звіт по наукових ступенях',
    };

    const groupTitle = groupBy ? groupTitleMap[groupBy] : 'Загальний звіт';
    const ratingTitle = ratingParticipant?.rating.title || 'Невідомий рейтинг';
    const ratingType = ratingParticipant?.rating.type || '';

    // 📄 Титульна сторінка
    doc.font('DejaVuSans-Bold').fontSize(22).fillColor('#003087')
      .text(ratingTitle, { align: 'center' }).moveDown(1);

    doc.font('DejaVuSans').fontSize(16).fillColor('black')
      .text(ratingType, { align: 'center' }).moveDown(1);

    doc.font('DejaVuSans-Bold').fontSize(18).fillColor('#000000')
      .text(groupTitle, { align: 'center' }).moveDown(2);

    doc.fontSize(12)
      .text(`Дата генерації: ${new Date().toLocaleDateString('uk-UA')}`, { align: 'center' });

    doc.addPage();

    // 📊 Групи
    for (const group of report) {
      if (doc.y > 50) {
        doc.addPage();
      }

      const startY = doc.y < 50 ? 50 : doc.y;

      doc.fillColor('white').font('DejaVuSans-Bold').fontSize(13);
      doc.rect(50, startY, 500, 25).fill('#003087').stroke('#000000');
      doc.fillColor('white').text(group.name, 55, startY + 5, { width: 490 });
      doc.moveTo(50, startY + 30).lineTo(550, startY + 30).lineWidth(2).stroke('#000000');

      doc.font('DejaVuSans').fontSize(11).fillColor('black');
      const statsY = startY + 40;
      doc.text(`Всього учасників: ${group.totalParticipants}`, 50, statsY);
      doc.text(`Заповнено: ${group.filledCount}`, 50, statsY + 18);
      doc.text(`Підтверджено: ${group.approvedCount}`, 50, statsY + 36);
      doc.text(`На доопрацюванні: ${group.revisionCount}`, 50, statsY + 54);
      doc.text(`Очікують заповнення: ${group.pendingCount}`, 50, statsY + 72);
      doc.text(`Середній бал: ${group.averageScore.toFixed(2)}`, 50, statsY + 90);

      let currentY = statsY + 110;
      let rowIndex = 0;

      const drawTableHeader = () => {
        doc.font('DejaVuSans-Bold').fontSize(9);
        doc.rect(50, currentY, 500, 20).fill('#D3E4FF').stroke('#000000');
        doc.fillColor('black')
          .text('ПІБ', 55, currentY + 5, { width: 250 })
          .text('Статус', 310, currentY + 5, { width: 120 })
          .text('Бали', 440, currentY + 5, { width: 60, align: 'center' });
        currentY += 20;
        doc.font('DejaVuSans').fontSize(9);
      };

      drawTableHeader();

      for (const participant of group.participants) {
        if (currentY + 30 > doc.page.height - 50) {
          doc.addPage();
          currentY = 50;
          drawTableHeader();
          rowIndex = 0;
        }

        const rowColor = rowIndex % 2 === 0 ? '#FFFFFF' : '#F5F5F5';
        doc.rect(50, currentY, 500, 20).fill(rowColor).stroke('#000000');

        doc.fillColor(this.getStatusColor(participant.status))
          .text(participant.name, 55, currentY + 5, { width: 250 })
          .text(this.getStatusText(participant.status), 310, currentY + 5, { width: 120 })
          .text(participant.score.toString(), 440, currentY + 5, { width: 60, align: 'center' });

        currentY += 20;
        rowIndex++;
      }

      doc.moveDown(2);
    }

    // 📄 Підсумкова сторінка
    if (doc.y > 50) {
      doc.addPage();
    }

    doc.font('DejaVuSans-Bold').fontSize(14).fillColor('white');
    doc.rect(50, 50, 500, 25).fill('#003087').stroke('#000000');
    doc.text('Підсумки по групах', 55, 55);

    let currentY = 90;
    let rowIndex = 0;
    const rowHeight = 30;

    const drawSummaryHeader = () => {
      doc.font('DejaVuSans-Bold').fontSize(8);
      doc.rect(50, currentY, 500, rowHeight).fill('#D3E4FF').stroke('#000000');
      doc.fillColor('black')
        .text('Група', 55, currentY + 8, { width: 150, ellipsis: true })
        .text('Учас.', 205, currentY + 8, { width: 40, align: 'center' })
        .text('Сер. бал', 245, currentY + 8, { width: 60, align: 'center' })
        .text('Заповн.', 305, currentY + 8, { width: 50, align: 'center' })
        .text('Підтв.', 355, currentY + 8, { width: 50, align: 'center' })
        .text('Доопрацювання', 405, currentY + 8, { width: 120, align: 'center' });
      currentY += rowHeight;
      doc.font('DejaVuSans').fontSize(8);
    };


    drawSummaryHeader();

    for (const group of report) {
      if (currentY + rowHeight > doc.page.height - 50) {
        doc.addPage();
        currentY = 50;
        drawSummaryHeader();
      }

      const rowColor = rowIndex % 2 === 0 ? '#FFFFFF' : '#F5F5F5';

      doc.rect(50, currentY, 500, rowHeight).fill(rowColor).stroke('#000000');
      doc.fillColor('black')
        .text(group.name, 55, currentY + 8, { width: 150, ellipsis: true })
        .text(group.totalParticipants.toString(), 205, currentY + 8, { width: 40, align: 'center' })
        .text(group.averageScore.toFixed(2), 245, currentY + 8, { width: 60, align: 'center' })
        .text(group.filledCount.toString(), 305, currentY + 8, { width: 50, align: 'center' })
        .text(group.approvedCount.toString(), 355, currentY + 8, { width: 50, align: 'center' })
        .text(group.revisionCount.toString(), 405, currentY + 8, { width: 120, align: 'center' });
      currentY += rowHeight;

      rowIndex++;
    }

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.end();
    });
  }




  private getStatusColor(status: RatingParticipantStatus): string {
    switch (status) {
      case RatingParticipantStatus.PENDING:
        return '#FF0000'; // Red for not filled
      case RatingParticipantStatus.FILLED:
        return '#000000'; // Black for filled
      case RatingParticipantStatus.APPROVED:
        return '#008000'; // Green for approved
      case RatingParticipantStatus.REVISION:
        return '#FFA500'; // Orange for revision
      default:
        return '#000000';
    }
  }

  private getStatusText(status: RatingParticipantStatus): string {
    switch (status) {
      case RatingParticipantStatus.PENDING:
        return 'Не заповнено';
      case RatingParticipantStatus.FILLED:
        return 'Заповнено';
      case RatingParticipantStatus.APPROVED:
        return 'Підтверджено';
      case RatingParticipantStatus.REVISION:
        return 'На доопрацюванні';
      default:
        return status;
    }
  }

  // Додано метод для перетворення enum Position у текст
  private getPositionText(position: Position): string {
    return position || 'Невідомо';
  }
}