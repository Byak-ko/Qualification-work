import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RatingParticipant, RatingParticipantStatus } from 'src/entities/rating-participant.entity';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { RatingApproval, RatingApprovalStatus } from 'src/entities/rating-approval.entity';
import { RatingApprovalDto } from '../dto/rating-approval.dto';
import { Rating } from 'src/entities/rating.entity';



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
            relations: ['responses', 'rating', 'rating.items', 'responses.documents', 'responses.item', 'approvals', 'respondent'],
        });
        console.log("Participant", participant);
        if (!participant) throw new NotFoundException('Респондент або рейтинг не знайдено');

        const isReviewer = await this.ratingApprovalRepository.findOne({
            where: { participant: { id: participant.id }, reviewer: { id: reviewerId } },
        });

        if (!isReviewer) throw new ForbiddenException('Ви не є рецензентом цього рейтингу');
        //if (participant.status != 'filled') {
        //  throw new BadRequestException('Респондент ще не завершив заповнення рейтингу');
        //}
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
            responses: participant.responses.map((response) => ({
                id: response.id,
                itemId: response.item.id,
                itemName: response.item.name,
                maxScore: response.item.maxScore,
                score: response.score,
                documents: response.documents.map((doc) => ({
                    id: doc.id,
                    url: doc.url,
                })),
            })),
        };
    }


    async reviewRating(ratingId: number, dto: RatingApprovalDto, userId: number) {
        const participant = await this.ratingParticipantRepository.findOne({
          where: { rating: { id: ratingId } },
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
        
        approval.status = dto.status;
        approval.comments = dto.comments || {};
        await this.ratingApprovalRepository.save(approval);
        
        if (dto.status === 'approved') {

          if (approval.reviewLevel === 'department' && participant.unitReviewer) {
            const unitApproval = participant.approvals.find(a => 
              a.reviewLevel === 'unit' && a.reviewer.id === participant.unitReviewer.id
            );
            
            if (unitApproval) {
              unitApproval.status = RatingApprovalStatus.REVISION;
              await this.ratingApprovalRepository.save(unitApproval);
              await this.mailService.sendNextReviewerNotification(participant, participant.unitReviewer);
            }
          } 
          else if ((approval.reviewLevel === 'department' && !participant.unitReviewer) || 
                   (approval.reviewLevel === 'unit')) {
            const authorApproval = participant.approvals.find(a => 
              a.reviewLevel === 'author' && a.reviewer.id === participant.rating.author.id
            );
            
            if (authorApproval) {
              authorApproval.status = RatingApprovalStatus.REVISION;
              await this.ratingApprovalRepository.save(authorApproval);
              await this.mailService.sendNextReviewerNotification(participant, participant.rating.author);
            }
          } 
          else if (approval.reviewLevel === 'author') {
            participant.status = RatingParticipantStatus.APPROVED;
            await this.ratingParticipantRepository.save(participant);
            await this.mailService.sendRatingApprovedNotification(participant);
          }
        } 
        else if (dto.status === 'pending') {
          participant.status = RatingParticipantStatus.REVISION;
          await this.ratingParticipantRepository.save(participant);
          await this.mailService.sendRevisionRequiredNotification(participant, approval.reviewer);
        }
        
        return { success: true };
      }

}