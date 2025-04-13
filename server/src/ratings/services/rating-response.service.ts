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
import { RatingStatus } from 'src/entities/rating.entity';

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
      relations: [
        'rating', 
        'rating.items', 
        'responses', 
        'responses.respondent'
      ],
    });
    
    console.log("Rating status:", participant?.rating?.status);
    console.log("Participant status:", participant?.status);

    if (!participant) {
      throw new ForbiddenException('Ви не є респондентом цього рейтингу');
    }

    if (participant.status === RatingParticipantStatus.FILLED) {
      throw new ForbiddenException('Ви вже заповнили цей рейтинг');
    }

    if (participant.status === RatingParticipantStatus.APPROVED) {
      throw new ForbiddenException('Рейтинг вже підтверджений');
    }

    if (participant.rating.status === RatingStatus.CREATED) {
      throw new ForbiddenException('Рейтинг вже відхилено');
    }

    if (participant.rating.status === RatingStatus.CLOSED) {
      throw new ForbiddenException('Рейтинг вже закритий');
    }

    // Find the response for this participant
    const response = participant.responses.find(
      response => response.respondent && response.respondent.id === userId
    );
    
    // Get scores and documents from the response or initialize empty objects
    const scores = response?.scores || {};
    const documents = response?.documents || {};
    
    return {
      id: participant.rating.id,
      title: participant.rating.title,
      type: participant.rating.type,
      participantId: participant.id,
      participantStatus: participant.status,
      items: participant.rating.items.map(item => {
        return {
          id: item.id,
          name: item.name,
          maxScore: item.maxScore,
          comment: item.comment,
          isDocNeed: item.isDocNeed,
          score: scores[item.id] || 0,
          documentUrls: documents[item.id] || []
        };
      }),
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
        'approvals.reviewer',
        'responses',
        'responses.respondent'
      ],
    });

    if (!participant) {
      throw new ForbiddenException('Ви не є респондентом цього рейтингу');
    }

    // Find existing response or create a new one
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

    // Initialize or update scores and documents
    const scores: Record<number, number> = response.scores || {};
    const documents: Record<number, string[]> = response.documents || {};

    // Process each item in the DTO
    for (const item of dto.items) {
      // Update score for this item
      scores[item.id] = item.score;
      
      // Update documents for this item
      documents[item.id] = item.documents;
    }

    // Update the response with new data
    response.scores = scores;
    response.documents = documents;
    
    // Save the response
    await this.ratingResponseRepository.save(response);

    return {
      message: 'Рейтинг успішно заповнено',
    };
  }

  async fillRespondentRating(ratingId: number, userId: number) {

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
    console.log(notificationResult.message);

    return {
      message: 'Рейтинг успішно заповнено',
      notification: notificationResult.success ?
        'Сповіщення перевіряючому надіслано' :
        'Не вдалося надіслати сповіщення перевіряючому'
    };
  }
}