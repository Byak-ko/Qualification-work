import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from 'src/entities/rating.entity';

@Injectable()
export class RatingQueryService {
  constructor(
    @InjectRepository(Rating) private ratingRepository: Repository<Rating>,
  ) {}

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

    const departmentReviewerIds = new Set<number>();
    const unitReviewerIds = new Set<number>();

    rating.participants.forEach(participant => {
      if (participant.departmentReviewer) {
        departmentReviewerIds.add(participant.departmentReviewer.id);
      }

      if (participant.unitReviewer) {
        unitReviewerIds.add(participant.unitReviewer.id);
      }
    });

    const departmentReviewers = rating.reviewers
      .filter(reviewer => departmentReviewerIds.has(reviewer.id))
      .map(reviewer => ({
        id: reviewer.id,
        firstName: reviewer.firstName,
        lastName: reviewer.lastName,
        email: reviewer.email,
        department: reviewer.department ? {
          id: reviewer.department.id,
          name: reviewer.department.name
        } : null
      }));

    const unitReviewers = rating.reviewers
      .filter(reviewer => unitReviewerIds.has(reviewer.id))
      .map(reviewer => ({
        id: reviewer.id,
        firstName: reviewer.firstName,
        lastName: reviewer.lastName,
        email: reviewer.email,
        unit: reviewer.department.unit ? {
          id: reviewer.department.unit.id,
          name: reviewer.department.unit.name
        } : null
      }));

    return {
      id: rating.id,
      name: rating.name,
      type: rating.type,
      author: {
        id: rating.author.id,
        firstName: rating.author.firstName,
        lastName: rating.author.lastName,
        email: rating.author.email,
      },
      reviewers: rating.reviewers.map((reviewer) => ({
        id: reviewer.id,
        firstName: reviewer.firstName,
        lastName: reviewer.lastName,
        email: reviewer.email,
      })),
      departmentReviewers,
      unitReviewers,
      participants: rating.participants.map((participant) => ({
        id: participant.id,
        respondent: {
          id: participant.respondent.id,
          firstName: participant.respondent.firstName,
          lastName: participant.respondent.lastName,
          email: participant.respondent.email,
        },
        departmentReviewer: participant.departmentReviewer ? {
          id: participant.departmentReviewer.id,
          firstName: participant.departmentReviewer.firstName,
          lastName: participant.departmentReviewer.lastName,
        } : null,
        unitReviewer: participant.unitReviewer ? {
          id: participant.unitReviewer.id,
          firstName: participant.unitReviewer.firstName,
          lastName: participant.unitReviewer.lastName,
        } : null
      })),
      items: rating.items.map((item) => ({
        id: item.id,
        name: item.name,
        maxScore: item.maxScore,
        comment: item.comment,
        isDocNeed: item.isDocNeed
      })),
    };
  }

  async getRatings() {
    return this.ratingRepository.find({ relations: ['author', 'participants', 'reviewers'] });
  }
}