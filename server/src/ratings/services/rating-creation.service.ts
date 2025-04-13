import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating, RatingStatus } from '../../entities/rating.entity';
import { User } from '../../entities/user.entity';
import { RatingItem } from '../../entities/rating-item.entity';
import { CreateRatingDto } from '../dto/create-rating.dto';
import { Document } from 'src/entities/document.entity';
import { RatingApproval, RatingApprovalStatus, ReviewLevel } from '../../entities/rating-approval.entity';
import { RatingParticipant } from '../../entities/rating-participant.entity';
import { RatingResponse } from '../../entities/rating-response.entity';
import { In } from 'typeorm';
import { MailService } from '../../mail/mail.service';
import { DataSource } from 'typeorm';

@Injectable()
export class RatingCreationService {
  constructor(
    @InjectRepository(Rating) private ratingRepository: Repository<Rating>,
    @InjectRepository(User) private userRepository: Repository<User>, private mailService: MailService,
    @InjectRepository(RatingItem) private ratingItemRepository: Repository<RatingItem>,
    @InjectRepository(RatingApproval) private ratingApprovalRepository: Repository<RatingApproval>,
    @InjectRepository(Document) private documentRepository: Repository<Document>,
    @InjectRepository(RatingParticipant) private ratingParticipantRepository: Repository<RatingParticipant>,
    @InjectRepository(RatingResponse) private ratingResponseRepository: Repository<RatingResponse>,
    private dataSource: DataSource,
  ) { }

  async createRating(authorId: number, dto: CreateRatingDto) {
    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (!author) throw new NotFoundException('Автор не знайдений');

    const respondents = await this.userRepository.find({
      where: { id: In(dto.respondentIds ?? []) },
      relations: ['department', 'department.unit']
    });
    if (respondents.length !== (dto.respondentIds?.length || 0)) {
      throw new BadRequestException('Один або більше респондентів не знайдено');
    }

    const departmentReviewers = await this.userRepository.find({
      where: { id: In(dto.reviewerDepartmentsIds ?? []) },
      relations: ['department', 'department.unit']
    });
    if (departmentReviewers.length !== (dto.reviewerDepartmentsIds?.length || 0)) {
      throw new BadRequestException('Один або більше перевіряючих відділу не знайдено');
    }

    const unitReviewers = await this.userRepository.find({
      where: { id: In(dto.reviewerUnitsIds ?? []) },
      relations: ['department', 'department.unit']
    });
    if (unitReviewers.length !== (dto.reviewerUnitsIds?.length || 0)) {
      throw new BadRequestException('Один або більше перевіряючих підрозділу не знайдено');
    }

    const reviewersByDepartment = departmentReviewers.reduce((acc, reviewer) => {
      if (reviewer.department?.id) {
        acc[reviewer.department.id] = reviewer;
      }
      return acc;
    }, {});

    const reviewersByUnit = unitReviewers.reduce((acc, reviewer) => {
      if (reviewer.department?.unit.id) {
        acc[reviewer.department.unit.id] = reviewer;
      }
      return acc;
    }, {});

    const allReviewers = [author, ...departmentReviewers, ...unitReviewers];

    const rating = this.ratingRepository.create({
      title: dto.title,
      type: dto.type,
      author,
      status: RatingStatus.CREATED,
      reviewers: allReviewers,
      endedAt: dto.endedAt, 
    });
    await this.ratingRepository.save(rating);

    const ratingItems = dto.items.map((item) =>
      this.ratingItemRepository.create({
        rating,
        name: item.name,
        maxScore: item.maxScore,
        comment: item.comment,
        isDocNeed: item.isDocNeed,
      }),
    );
    await this.ratingItemRepository.save(ratingItems);

    const participants: RatingParticipant[] = [];

    for (const respondent of respondents) {
      const participant = this.ratingParticipantRepository.create({
        rating,
        respondent,
      });

      if (respondent.department?.id && departmentReviewers.length > 0) {
        const matchedDepartmentReviewer = reviewersByDepartment[respondent.department.id];
        if (matchedDepartmentReviewer) {
          participant.departmentReviewer = matchedDepartmentReviewer;
        }
      }
      if (respondent.department?.unit.id && unitReviewers.length > 0) {
        const matchedUnitReviewer = reviewersByUnit[respondent.department.unit.id];
        if (matchedUnitReviewer) {
          participant.unitReviewer = matchedUnitReviewer;
        }
      }

      participant.customerReviewer = author;

      participants.push(participant);
    }

    await this.ratingParticipantRepository.save(participants);

    // Create one response per participant with empty scores and documents
    for (const participant of participants) {
      const response = this.ratingResponseRepository.create({
        rating,
        respondent: participant.respondent,
        participant,
        scores: {},
        documents: {}
      });
      await this.ratingResponseRepository.save(response);
    }

    const allApprovals: RatingApproval[] = [];

    for (const participant of participants) {
      if (participant.departmentReviewer) {
        const departmentApproval = this.ratingApprovalRepository.create({
          participant,
          reviewer: participant.departmentReviewer,
          status: RatingApprovalStatus.PENDING,
          comments: {},
          reviewLevel: ReviewLevel.DEPARTMENT,
        });
        allApprovals.push(departmentApproval);
      }

      if (participant.unitReviewer) {
        const unitApproval = this.ratingApprovalRepository.create({
          participant,
          reviewer: participant.unitReviewer,
          status: RatingApprovalStatus.PENDING,
          comments: {},
          reviewLevel: ReviewLevel.UNIT,
        });
        allApprovals.push(unitApproval);
      }

      if (participant.customerReviewer) {
        const customerApproval = this.ratingApprovalRepository.create({
          participant,
          reviewer: participant.customerReviewer,
          status: RatingApprovalStatus.PENDING,
          comments: {},
          reviewLevel: ReviewLevel.AUTHOR,
        });
        allApprovals.push(customerApproval);
      }
    }

    if (allApprovals.length > 0) {
      await this.ratingApprovalRepository.save(allApprovals);
    }

    try {
      await this.mailService.sendRatingNotification(rating, respondents);
      console.log('Повідомлення успішно відправлені');
    } catch (error) {
      console.error('Помилка відправки повідомлень:', error);
    }

    return rating;
  }

  async editRating(ratingId: number, authorId: number, dto: CreateRatingDto) {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['items', 'participants', 'participants.responses', 'author']
    });

    if (!rating) {
      throw new NotFoundException('Рейтинг не знайдений');
    }

    if (rating.author.id !== authorId) {
      throw new BadRequestException('Ви не є автором цього рейтингу');
    }

    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (!author) throw new NotFoundException('Автор не знайдений');

    const respondents = await this.userRepository.find({
      where: { id: In(dto.respondentIds ?? []) },
      relations: ['department', 'department.unit']
    });
    if (respondents.length !== (dto.respondentIds?.length || 0)) {
      throw new BadRequestException('Один або більше респондентів не знайдено');
    }

    const departmentReviewers = await this.userRepository.find({
      where: { id: In(dto.reviewerDepartmentsIds ?? []) },
      relations: ['department', 'department.unit']
    });
    if (departmentReviewers.length !== (dto.reviewerDepartmentsIds?.length || 0)) {
      throw new BadRequestException('Один або більше перевіряючих відділу не знайдено');
    }

    const unitReviewers = await this.userRepository.find({
      where: { id: In(dto.reviewerUnitsIds ?? []) },
      relations: ['department', 'department.unit']
    });
    if (unitReviewers.length !== (dto.reviewerUnitsIds?.length || 0)) {
      throw new BadRequestException('Один або більше перевіряючих підрозділу не знайдено');
    }

    const reviewersByDepartment = departmentReviewers.reduce((acc, reviewer) => {
      if (reviewer.department?.id) {
        acc[reviewer.department.id] = reviewer;
      }
      return acc;
    }, {});

    const reviewersByUnit = unitReviewers.reduce((acc, reviewer) => {
      if (reviewer.department?.unit.id) {
        acc[reviewer.department.unit.id] = reviewer;
      }
      return acc;
    }, {});

    const allReviewers = [author, ...departmentReviewers, ...unitReviewers];

    rating.title = dto.title;
    rating.type = dto.type;
    rating.author = author;
    rating.reviewers = allReviewers;
    rating.endedAt = dto.endedAt;

    await this.dataSource.transaction(async manager => {
      await manager.save(rating);

      if (rating.items?.length) {
        await manager.remove(rating.items);
      }

      const ratingItems = dto.items.map((item) =>
        this.ratingItemRepository.create({
          rating,
          name: item.name,
          maxScore: item.maxScore,
          comment: item.comment,
          isDocNeed: item.isDocNeed,
        }),
      );
      await manager.save(ratingItems);

      if (rating.participants?.length) {
        // Remove old responses first
        for (const participant of rating.participants) {
          if (participant.responses?.length) {
            await manager.remove(participant.responses);
          }
        }
        await manager.remove(rating.participants);
      }

      const participants: RatingParticipant[] = [];

      for (const respondent of respondents) {
        const participant = this.ratingParticipantRepository.create({
          rating,
          respondent,
        });

        if (respondent.department?.id && departmentReviewers.length > 0) {
          const matchedDepartmentReviewer = reviewersByDepartment[respondent.department.id];
          if (matchedDepartmentReviewer) {
            participant.departmentReviewer = matchedDepartmentReviewer;
          }
        }
        if (respondent.department?.unit.id && unitReviewers.length > 0) {
          const matchedUnitReviewer = reviewersByUnit[respondent.department.unit.id];
          if (matchedUnitReviewer) {
            participant.unitReviewer = matchedUnitReviewer;
          }
        }

        participant.customerReviewer = author;

        participants.push(participant);
      }

      await manager.save(participants);

      // Create one response per participant with empty scores and documents
      for (const participant of participants) {
        const response = this.ratingResponseRepository.create({
          rating,
          respondent: participant.respondent,
          participant,
          scores: {},
          documents: {}
        });
        await manager.save(response);
      }

      const allApprovals: RatingApproval[] = [];

      for (const participant of participants) {
        if (participant.departmentReviewer) {
          const departmentApproval = this.ratingApprovalRepository.create({
            participant,
            reviewer: participant.departmentReviewer,
            status: RatingApprovalStatus.PENDING,
            comments: {},
            reviewLevel: ReviewLevel.DEPARTMENT,
          });
          allApprovals.push(departmentApproval);
        }

        if (participant.unitReviewer) {
          const unitApproval = this.ratingApprovalRepository.create({
            participant,
            reviewer: participant.unitReviewer,
            status: RatingApprovalStatus.PENDING,
            comments: {},
            reviewLevel: ReviewLevel.UNIT,
          });
          allApprovals.push(unitApproval);
        }

        if (participant.customerReviewer) {
          const customerApproval = this.ratingApprovalRepository.create({
            participant,
            reviewer: participant.customerReviewer,
            status: RatingApprovalStatus.PENDING,
            comments: {},
            reviewLevel: ReviewLevel.AUTHOR,
          });
          allApprovals.push(customerApproval);
        }
      }

      if (allApprovals.length > 0) {
        await manager.save(allApprovals);
      }
    });

    const updatedRating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['items', 'participants', 'participants.respondent', 'author']
    });

    return updatedRating;
  }

  async completeRating(ratingId: number) {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['items', 'participants', 'participants.respondent', 'author']
    });

    if (!rating) {
      throw new NotFoundException('Рейтинг не знайдено');
    }

    rating.status = RatingStatus.PENDING;
    await this.ratingRepository.save(rating);

    
      try {
        await this.mailService.sendRatingNotification(rating, rating.participants.map(p => p.respondent));
        console.log('Повідомлення успішно відправлені');
      } catch (error) {
        console.error('Помилка відправки повідомлень:', error);
      }
     

    return rating;
  }

  async finalizeRating(ratingId: number) {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['items', 'participants', 'participants.respondent', 'author']
    });

    if (!rating) {
      throw new NotFoundException('Рейтинг не знайдено');
    }

    rating.status = RatingStatus.CLOSED;
    await this.ratingRepository.save(rating);

    try {
      await this.mailService.sendRatingNotification(rating, rating.participants.map(p => p.respondent));
      console.log('Повідомлення успішно відправлені');
    } catch (error) {
      console.error('Помилка відправки повідомлень:', error);
      throw new Error('Помилка відправки повідомлень');
    }

    return rating;
  }
}