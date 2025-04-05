import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from 'src/entities/document.entity';
import { RatingParticipant } from 'src/entities/rating-participant.entity';
import { RatingResponse } from 'src/entities/rating-response.entity';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { RatingParticipantStatus } from 'src/entities/rating-participant.entity';
import { FillRatingDto } from '../dto/fill-rating.dto';
import { RatingApproval, RatingApprovalStatus, ReviewLevel } from 'src/entities/rating-approval.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class RatingResponseService {
  constructor(
    @InjectRepository(RatingParticipant) private ratingParticipantRepository: Repository<RatingParticipant>,
    @InjectRepository(RatingResponse) private ratingResponseRepository: Repository<RatingResponse>,
    @InjectRepository(Document) private documentRepository: Repository<Document>,
    @InjectRepository(RatingApproval) private ratingApprovalRepository: Repository<RatingApproval>,
    private mailService: MailService,
  ) { }

  async getRatingForRespondent(ratingId: number, userId: number) {
    const participant = await this.ratingParticipantRepository.findOne({
      where: { rating: { id: ratingId }, respondent: { id: userId } },
      relations: ['rating', 'rating.items'],
    });

    if (!participant) {
      throw new ForbiddenException('Ви не є респондентом цього рейтингу');
    }

    return {
      id: participant.rating.id,
      name: participant.rating.name,
      type: participant.rating.type,
      items: participant.rating.items.map(item => ({
        id: item.id,
        name: item.name,
        maxScore: item.maxScore,
        comment: item.comment,
      })),
    };
  }

  async fillRating(ratingId: number, userId: number, dto: FillRatingDto) {
    const participant = await this.ratingParticipantRepository.findOne({
      where: { rating: { id: ratingId }, respondent: { id: userId } },
      relations: [
        'rating',
        'rating.items',
        'rating.author',
        'departmentReviewer',
        'unitReviewer',
        'respondent',
        'approvals',
        'approvals.reviewer'
      ],
    });

    if (!participant) {
      throw new ForbiddenException('Ви не є респондентом цього рейтингу');
    }

    for (const item of dto.items) {
      let response = await this.ratingResponseRepository.findOne({
        where: { item: { id: item.id }, respondent: { id: userId } },
        relations: ['documents'],
      });

      if (!response) {
        response = this.ratingResponseRepository.create({
          item: { id: item.id },
          respondent: { id: userId },
          score: item.score,
          participant: participant,
        });
      } else {
        response.score = item.score;
      }

      const documentEntities = await Promise.all(
        item.documents.map(async (url) => {
          let document = await this.documentRepository.findOne({ where: { url } });
          if (!document) {
            document = this.documentRepository.create({ url });
            await this.documentRepository.save(document);
          }
          return document;
        })
      );

      response.documents = documentEntities;
      await this.ratingResponseRepository.save(response);
    }

    let reviewer: User | undefined = undefined;
    let reviewLevel: ReviewLevel | undefined = undefined;

    if (participant.departmentReviewer) {
      reviewer = participant.departmentReviewer;
      reviewLevel = ReviewLevel.DEPARTMENT;
    } else if (participant.unitReviewer) {
      reviewer = participant.unitReviewer;
      reviewLevel = ReviewLevel.UNIT;
    } else if (participant.rating.author) {
      reviewer = participant.rating.author;
      reviewLevel = ReviewLevel.AUTHOR;
    }

    if (reviewer && reviewLevel) {
      let approval = participant.approvals?.find(a =>
        a.reviewLevel === reviewLevel && a.reviewer.id === reviewer.id
      );

      if (approval) {
        approval.status = RatingApprovalStatus.REVISION;
        await this.ratingApprovalRepository.save(approval);
      }
    }

    participant.status = RatingParticipantStatus.FILLED;
    await this.ratingParticipantRepository.save(participant);

    const notificationResult = await this.mailService.sendReviewerNotification(participant);
    console.log(notificationResult.message);

    return {
      message: 'Рейтинг успішно заповнено',
      notification: notificationResult.success ?
        'Сповіщення перевіряючому надіслано' :
        'Не вдалося надіслати сповіщення перевіряючому'
    };
  }
}