import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating, RatingStatus } from 'src/entities/rating.entity';
import { RatingParticipant, RatingParticipantStatus } from 'src/entities/rating-participant.entity';
import { RatingApproval, RatingApprovalStatus } from 'src/entities/rating-approval.entity';
import { User } from 'src/entities/user.entity';
import { RatingApprovalCommentsDto } from '../dto/rating-approval.dto';

@Injectable()
export class RatingQueryService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Rating) private ratingRepository: Repository<Rating>,
    @InjectRepository(RatingParticipant) private ratingParticipantRepository: Repository<RatingParticipant>,
    @InjectRepository(RatingApproval) private ratingApprovalRepository: Repository<RatingApproval>,
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

    // Використовуємо деструктуризацію та обробку даних напряму
    const { id, title, type, author, endedAt, reviewers, participants, items } = rating;

    // Створюємо списки рецензентів
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

    // Форматуємо дані без використання DTO
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

    // Отримуємо рейтинги автора
    const ratingsAuthor = await this.ratingRepository.find({
      where: { author: { id: userId } },
      select: { id: true, title: true, type: true, status: true, endedAt: true },
    });

    // Отримуємо участі в рейтингах
    const participations = await this.ratingParticipantRepository.find({
      where: { respondent: { id: userId } },
      relations: ['rating'],
    });

    // Форматуємо дані для відповіді
    const ratingsRespondent = participations.map(participation => ({
      id: participation.rating.id,
      title: participation.rating.title,
      type: participation.rating.type,
      endedAt: participation.rating.endedAt,
      status: participation.rating.status,
      participantStatus: participation.status,
    }));

    // Отримуємо всі рейтинги, де користувач є перевіряючим
    const reviewerData = await this.getReviewerRatingsData(userId);

    return {
      ratingsAuthor,
      ratingsRespondent,
      ratingsReviewer: reviewerData,
    };
  }

  async getClosedRatings() {
    const closedRatings = await this.ratingRepository.find({
      where: { status: RatingStatus.CLOSED },
      select: { id: true, title: true, type: true, endedAt: true },
      order: { endedAt: 'DESC' }
    });
  
    return closedRatings;
  }

  private async getReviewerRatingsData(userId: number) {
    const reviewParticipants = await this.ratingParticipantRepository
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.rating', 'rating')
      .innerJoinAndSelect('participant.respondent', 'respondent')
      .leftJoinAndSelect('respondent.department', 'department')
      .where('(participant.departmentReviewer.id = :userId OR participant.unitReviewer.id = :userId OR participant.customerReviewer.id = :userId)',
        { userId })
      .andWhere('participant.status = :status', { status: RatingParticipantStatus.FILLED })
      .getMany();

    // Отримуємо всі статуси затверджень
    const approvals = await this.ratingApprovalRepository.find({
      where: { reviewer: { id: userId } },
      relations: ['participant'],
    });

    // Створюємо мапу статусів
    const approvalStatusMap = new Map();
    approvals.forEach(approval => {
      approvalStatusMap.set(approval.participant.id, approval.status);
    });

    // Групуємо за рейтингами
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

      // Додаємо учасника, якщо він ще не доданий
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
          approvalStatus: approvalStatusMap.get(participant.id) || RatingApprovalStatus.PENDING,
          participantStatus: participant.status
        });
      }
    });

    return Array.from(ratingsMap.values());
  }

  // Допоміжні методи форматування
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