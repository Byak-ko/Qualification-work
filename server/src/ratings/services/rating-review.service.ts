import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RatingParticipant, RatingParticipantStatus} from 'src/entities/rating-participant.entity';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { RatingApproval, RatingApprovalStatus, ReviewLevel } from 'src/entities/rating-approval.entity';
import { RatingApprovalDto } from '../dto/rating-approval.dto';

@Injectable()
export class RatingReviewService {
  constructor(
    @InjectRepository(RatingParticipant) private ratingParticipantRepository: Repository<RatingParticipant>,
    @InjectRepository(RatingApproval) private ratingApprovalRepository: Repository<RatingApproval>,
    private mailService: MailService,
  ) { }

  async getRatingForReview(ratingId: number, respondentId: number, reviewerId: number) {
    const participant = await this.ratingParticipantRepository.findOne({
      where: {
        rating: { id: ratingId },
        respondent: { id: respondentId },
      },
      relations: ['responses', 'responses.respondent', 'rating', 'rating.items', 'approvals', 'respondent'],
    });
    if (!participant) throw new NotFoundException('Респондент або рейтинг не знайдено');

    const isReviewer = await this.ratingApprovalRepository.findOne({
      where: { participant: { id: participant.id }, reviewer: { id: reviewerId } },
    });

    if (!isReviewer) throw new ForbiddenException('Ви не є рецензентом цього рейтингу');
    //if (participant.status != 'filled') {
    //  throw new BadRequestException('Респондент ще не завершив заповнення рейтингу');
    //}

    // Find the response for this participant
    const response = participant.responses.find(
      response => response.respondent && response.respondent.id === respondentId
    );

    // Get scores and documents from the response
    const scores = response?.scores || {};
    const documents = response?.documents || {};

    return {
      name: participant.rating.title,
      type: participant.rating.type,
      participantId: participant.id,
      respondent: {
        id: participant.respondent.id,
        firstName: participant.respondent.firstName,
        lastName: participant.respondent.lastName,
        email: participant.respondent.email,
      },
      responses: participant.rating.items.map(item => {
        const itemId = item.id;
        return {
          itemId: itemId,
          itemName: item.name,
          maxScore: item.maxScore,
          score: scores[itemId] || 0,
          comment: item.comment,
          documents: (documents[itemId] || []).map(url => ({
            url: url
          })),
        };
      }),
    };
  }


  async reviewRating(ratingId: number, dto: RatingApprovalDto, userId: number) {
    const participant = await this.ratingParticipantRepository.findOne({
      where: { rating: { id: ratingId }, respondent: { id: userId } },
      relations: [
        'approvals',
        'approvals.reviewer',
        'rating',
        'rating.author',
        'departmentReviewer',
        'unitReviewer',
        'respondent'
      ],
    });
    
    if (!participant) throw new NotFoundException('Рейтинг не знайдено');

    const approval = await this.ratingApprovalRepository.findOne({
      where: { participant: { id: participant.id }, reviewer: { id: userId } },
      relations: ['reviewer']
    });

    if (!approval) {
      throw new ForbiddenException('Ви не є рецензентом цього рейтингу');
    }

    if (dto.status === 'approved') {
      if (approval.reviewLevel === ReviewLevel.DEPARTMENT && participant.unitReviewer) {
        const unitApproval = participant.approvals.find(a =>
          a.reviewLevel === ReviewLevel.UNIT && a.reviewer.id === participant.unitReviewer.id
        );
        
        if (unitApproval) {
          unitApproval.status = RatingApprovalStatus.REVISION;
          await this.ratingApprovalRepository.save(unitApproval);
          await this.mailService.sendNextReviewerNotification(participant, participant.unitReviewer);
        }
      }
      else if ((approval.reviewLevel === ReviewLevel.DEPARTMENT && !participant.unitReviewer) ||
        (approval.reviewLevel === ReviewLevel.UNIT)) {
        const authorApproval = participant.approvals.find(a =>
          a.reviewLevel === ReviewLevel.AUTHOR && a.reviewer.id === participant.rating.author.id
        );

        if (authorApproval) {
          authorApproval.status = RatingApprovalStatus.REVISION;
          await this.ratingApprovalRepository.save(authorApproval);
          await this.mailService.sendNextReviewerNotification(participant, participant.rating.author);
        }
      }
      else if (approval.reviewLevel === ReviewLevel.AUTHOR) {
        participant.status = RatingParticipantStatus.APPROVED;
        await this.ratingParticipantRepository.save(participant);
        await this.mailService.sendRatingApprovedNotification(participant);
      }
    }
    else if (dto.status === 'pending') {
      participant.status = RatingParticipantStatus.REVISION;
      await this.ratingParticipantRepository.save(participant);
      
      // Reset all other approvals to pending status
      if (participant.approvals) {
        // Find all approvals that are not the current one and have been approved
        const otherApprovals = participant.approvals.filter(a => 
          a.id !== approval.id && a.status !== RatingApprovalStatus.PENDING
        );
        
        // Set them back to pending
        for (const otherApproval of otherApprovals) {
          otherApproval.status = RatingApprovalStatus.PENDING;
          await this.ratingApprovalRepository.save(otherApproval);
        }
      }
      await this.ratingParticipantRepository.save(participant);
      await this.mailService.sendRevisionRequiredNotification(participant, approval.reviewer);
      
      const savedApproval = await this.ratingApprovalRepository.findOne({
        where: { id: approval.id }
      });
      if (savedApproval) {
        savedApproval.status = dto.status;
        savedApproval.comments = dto.comments || {};
        await this.ratingApprovalRepository.save(savedApproval);
      }
    }

    return { success: true };
  }

}