import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RatingParticipant } from 'src/entities/rating-participant.entity';
import { RatingResponse } from 'src/entities/rating-response.entity';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { RatingParticipantStatus } from 'src/entities/rating-participant.entity';
import { FillRatingDto } from '../dto/fill-rating.dto';
import { RatingApproval, RatingApprovalStatus, ReviewLevel } from 'src/entities/rating-approval.entity';
import { User } from 'src/entities/user.entity';
import { RatingStatus } from 'src/entities/rating.entity';

@Injectable()
export class RatingResponseService {
  constructor(
    @InjectRepository(RatingParticipant) private ratingParticipantRepository: Repository<RatingParticipant>,
    @InjectRepository(RatingResponse) private ratingResponseRepository: Repository<RatingResponse>,
    @InjectRepository(RatingApproval) private ratingApprovalRepository: Repository<RatingApproval>,
    private mailService: MailService,
  ) { }

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
        'approvals.reviewer',
        'responses',
        'responses.respondent'
      ],
    });

    if (!participant) {
      throw new ForbiddenException('Ви не є респондентом цього рейтингу');
    }

    let response = participant.responses.find(
      response => response.respondent && response.respondent.id === userId
    );

    if (!response) {
      response = this.ratingResponseRepository.create({
        respondent: { id: userId },
        rating: { id: ratingId },
        participant: participant,
        scores: {},
        documents: {}
      });
    }

    const scores: Record<number, number> = response.scores || {};
    const documents: Record<number, string[]> = response.documents || {};

    for (const item of dto.items) {
      scores[item.id] = item.score;
      
      documents[item.id] = item.documents;
    }

    response.scores = scores;
    response.documents = documents;

    await this.ratingResponseRepository.save(response);

    return {
      message: 'Рейтинг успішно заповнено',
    };
  }

  async fillCompleteRating(ratingId: number, userId: number) {

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
        'approvals.reviewer',
        'responses',
        'responses.respondent'
      ],
    });

    if (!participant) {
      throw new ForbiddenException('Ви не є респондентом цього рейтингу');
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

    return {
      message: 'Рейтинг успішно заповнено',
      notification: notificationResult.success ?
        'Сповіщення перевіряючому надіслано' :
        'Не вдалося надіслати сповіщення перевіряючому'
    };
  }
}