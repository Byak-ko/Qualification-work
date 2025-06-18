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


  async reviewRating(ratingId: number, dto: RatingApprovalDto, userId: number, respondentId: number) {
    const participant = await this.ratingParticipantRepository.findOne({
      where: { rating: { id: ratingId }, respondent: { id: respondentId } },
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
      approval.status = dto.status;
      approval.comments = {};
      await this.ratingApprovalRepository.save(approval);
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
          console.log("authorApproval", authorApproval);
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
      if (participant.approvals) {
        const otherApprovals = participant.approvals.filter(a => 
          a.id !== approval.id && a.status !== RatingApprovalStatus.PENDING
        );
        
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