import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Rating, RatingStatus } from 'src/entities/rating.entity';
import { RatingParticipant, RatingParticipantStatus } from 'src/entities/rating-participant.entity';
import { RatingApproval, RatingApprovalStatus } from 'src/entities/rating-approval.entity';
import { User } from 'src/entities/user.entity';
import { RatingResponse } from 'src/entities/rating-response.entity';
import { RatingApprovalCommentsDto } from '../dto/rating-approval.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RatingQueryService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Rating) private ratingRepository: Repository<Rating>,
    @InjectRepository(RatingParticipant) private ratingParticipantRepository: Repository<RatingParticipant>,
    @InjectRepository(RatingApproval) private ratingApprovalRepository: Repository<RatingApproval>,
    @InjectRepository(RatingResponse) private ratingResponseRepository: Repository<RatingResponse>,
  ) { }

  async getRatingDetails(ratingId: number) {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: [
        'author',
        'reviewers',
        'reviewers.department',
        'reviewers.department.unit',
        'participants',
        'participants.respondent',
        'participants.departmentReviewer',
        'participants.unitReviewer',
        'items'
      ],
    });

    if (!rating) {
      throw new NotFoundException('Рейтинг не знайдено');
    }

    const { id, title, type, author, endedAt, reviewers, participants, items } = rating;

    const departmentReviewerIds = new Set(
      participants
        .filter(p => p.departmentReviewer)
        .map(p => p.departmentReviewer.id)
    );

    const unitReviewerIds = new Set(
      participants
        .filter(p => p.unitReviewer)
        .map(p => p.unitReviewer.id)
    );

    return {
      id,
      title,
      type,
      endedAt,
      author: this.formatUser(author),
      reviewers: reviewers.map(reviewer => this.formatUser(reviewer)),
      departmentReviewers: reviewers
        .filter(reviewer => departmentReviewerIds.has(reviewer.id))
        .map(reviewer => ({
          ...this.formatUser(reviewer),
          department: reviewer.department ? {
            id: reviewer.department.id,
            name: reviewer.department.name
          } : null
        })),
      unitReviewers: reviewers
        .filter(reviewer => unitReviewerIds.has(reviewer.id))
        .map(reviewer => ({
          ...this.formatUser(reviewer),
          unit: reviewer.department?.unit ? {
            id: reviewer.department.unit.id,
            name: reviewer.department.unit.name
          } : null
        })),
      participants: participants.map(participant => ({
        id: participant.id,
        respondent: this.formatUser(participant.respondent),
        departmentReviewer: participant.departmentReviewer ?
          this.formatUserBasic(participant.departmentReviewer) : null,
        unitReviewer: participant.unitReviewer ?
          this.formatUserBasic(participant.unitReviewer) : null
      })),
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        maxScore: item.maxScore,
        comment: item.comment,
        isDocNeed: item.isDocNeed
      })),
    };
  }

  async getAllRatings() {
    const ratings = await this.ratingRepository.find({
      relations: ['author', 'participants', 'reviewers', 'items']
    });

    return ratings;
  }

  async getRatingsByUserId(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Користувача з ID ${userId} не знайдено`);
    }

    const ratingsAuthor = await this.ratingRepository.find({
      where: { author: { id: userId } },
      select: { id: true, title: true, type: true, status: true, endedAt: true },
    });
  
    const participations = await this.ratingParticipantRepository.find({
      where: { respondent: { id: userId }, rating: { status: Not(RatingStatus.CLOSED) } },
      relations: ['rating'],
    });
  
    const ratingsRespondent = participations.map(participation => ({
      id: participation.rating.id,
      title: participation.rating.title,
      type: participation.rating.type,
      endedAt: participation.rating.endedAt,
      status: participation.rating.status,
      participantStatus: participation.status,
    }));
  
    const reviewerData = await this.getReviewerRatingsData(userId);
    const sortRatings = (ratings: any[]) => {
      return ratings.sort((a, b) => {
        const isAClosed = a.status === RatingStatus.CLOSED;
        const isBClosed = b.status === RatingStatus.CLOSED;
        if (isAClosed !== isBClosed) {
          return isAClosed ? 1 : -1;
        }
  
        if (!a.endedAt && !b.endedAt) return 0;
        if (!a.endedAt) return 1;
        if (!b.endedAt) return -1; 
        return new Date(a.endedAt).getTime() - new Date(b.endedAt).getTime(); 
      });
    };
  
    const sortedRatingsAuthor = sortRatings(ratingsAuthor);
    const sortedRatingsRespondent = sortRatings(ratingsRespondent);
    const sortedRatingsReviewer = sortRatings(reviewerData);
  
    return {
      ratingsAuthor: sortedRatingsAuthor,
      ratingsRespondent: sortedRatingsRespondent,
      ratingsReviewer: sortedRatingsReviewer,
    };
  }

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

    const response = participant.responses.find(
      response => response.respondent && response.respondent.id === userId
    );

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
    if (participant.status != 'filled') {
      throw new BadRequestException('Респондент ще не завершив заповнення рейтингу');
    }

    const response = participant.responses.find(
      response => response.respondent && response.respondent.id === respondentId
    );

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

  async getClosedRatings() {
    const closedRatings = await this.ratingRepository.find({
      where: { status: RatingStatus.CLOSED },
      select: { id: true, title: true, type: true, endedAt: true },
      order: { endedAt: 'DESC' }
    });

    const ratingsWithDetails = await Promise.all(closedRatings.map(async (rating) => {
      const responses = await this.ratingResponseRepository.find({
        where: { rating: { id: rating.id } }
      });

      let totalDocumentsCount = 0;
      let totalSizeMB = 0;

      const documentUrls: string[] = [];
      responses.forEach(response => {
        Object.values(response.documents).forEach(docUrls => {
          if (Array.isArray(docUrls)) {
            totalDocumentsCount += docUrls.length;
            documentUrls.push(...docUrls);
          }
        });
      });

      totalSizeMB = await this.calculateFilesSize(documentUrls);

      return {
        id: rating.id,
        title: rating.title,
        type: rating.type,
        endedAt: rating.endedAt,
        documentsCount: totalDocumentsCount,
        totalSizeMB: totalSizeMB,
      };
    }));

    return ratingsWithDetails;
  }
  private async calculateFilesSize(documentUrls: string[]): Promise<number> {
    let totalSizeBytes = 0;

    for (const url of documentUrls) {
      try {
        const filePath = path.join(process.cwd(), 'uploads', this.extractFilenameFromUrl(url));

        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          totalSizeBytes += stats.size;
        }
      } catch (error) {
        console.error(`Помилка при обчисленні розміру файлу ${url}:`, error);
      }
    }

    return parseFloat((totalSizeBytes / (1024 * 1024)).toFixed(2));
  }

  private extractFilenameFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  private async getReviewerRatingsData(userId: number) {
    const reviewParticipants = await this.ratingParticipantRepository
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.rating', 'rating')
      .innerJoinAndSelect('participant.respondent', 'respondent')
      .leftJoinAndSelect('respondent.department', 'department')
      .where('(participant.departmentReviewer.id = :userId OR participant.unitReviewer.id = :userId OR participant.customerReviewer.id = :userId)',
        { userId })
      .andWhere('rating.status != :closedStatus', { closedStatus: RatingStatus.CLOSED })
      .andWhere('participant.status = :participantStatus', { participantStatus: RatingParticipantStatus.FILLED })
      .getMany();

    console.log('reviewParticipants', reviewParticipants);

    const approvals = await this.ratingApprovalRepository.find({
      where: { reviewer: { id: userId } },
      relations: ['participant'],
    });
    const approvalStatusMap = new Map();
    approvals.forEach(approval => {
      approvalStatusMap.set(approval.participant.id, approval.status);
    });

    const ratingsMap = new Map();

    reviewParticipants.forEach(participant => {
      const { rating } = participant;
      if (!ratingsMap.has(rating.id)) {
        ratingsMap.set(rating.id, {
          id: rating.id,
          title: rating.title,
          type: rating.type,
          status: rating.status,
          endedAt: rating.endedAt,
          participants: []
        });
      }

      const currentRating = ratingsMap.get(rating.id);
      const existingParticipant = currentRating.participants.find(
        p => p.id === participant.respondent.id
      );

      if (!existingParticipant) {
        currentRating.participants.push({
          id: participant.respondent.id,
          firstName: participant.respondent.firstName,
          lastName: participant.respondent.lastName,
          department: participant.respondent.department ? {
            id: participant.respondent.department.id,
            name: participant.respondent.department.name
          } : null,
          approvalStatus: approvalStatusMap.get(participant.id),
          participantStatus: participant.status
        });
      }
    });

    return Array.from(ratingsMap.values());
  }

  private formatUser(user: User) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }

  private formatUserBasic(user: User) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async getParticipantApprovals(participantId: number): Promise<RatingApprovalCommentsDto[]> {
    const approvals = await this.ratingApprovalRepository.find({
      where: { participant: { id: participantId } },
      relations: ['participant'],
    });

    return approvals.map(approval => ({
      reviewLevel: approval.reviewLevel,
      comments: approval.comments,
    }));
  }
}