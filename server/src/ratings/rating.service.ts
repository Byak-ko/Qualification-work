import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entities/rating.entity';
import { User } from '../entities/user.entity';
import { RatingItem } from '../entities/rating-item.entity';
import { RatingApproval } from '../entities/rating-approval.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Document } from 'src/entities/document.entity';
import { RatingApprovalDto } from './dto/rating-approval.dto';
import { RatingApprovalStatus } from '../entities/rating-approval.entity';
import { RatingParticipant } from '../entities/rating-participant.entity';
import { RatingResponse } from '../entities/rating-response.entity';
import { RatingStatus } from '../entities/rating-participant.entity';
import { FillRatingDto } from './dto/fill-rating.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating) private ratingRepository: Repository<Rating>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(RatingItem) private ratingItemRepository: Repository<RatingItem>,
    @InjectRepository(RatingApproval) private ratingApprovalRepository: Repository<RatingApproval>,
    @InjectRepository(Document) private documentRepository: Repository<Document>,
    @InjectRepository(RatingParticipant) private ratingParticipantRepository: Repository<RatingParticipant>,
    @InjectRepository(RatingResponse) private ratingResponseRepository: Repository<RatingResponse>,
  ) { }

  async createRating(authorId: number, dto: CreateRatingDto) {
    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (!author) throw new NotFoundException('Автор не знайдений');

    const respondents = await this.userRepository.findByIds(dto.respondentIds ?? []);
    if (respondents.length !== (dto.respondentIds?.length || 0)) {
      throw new BadRequestException('Один або більше респондентів не знайдено');
    }

    const reviewers = await this.userRepository.findByIds(dto.reviewerIds ?? []);
    if (reviewers.length !== (dto.reviewerIds?.length || 0)) {
      throw new BadRequestException('Один або більше перевіряючих не знайдено');
    }

    const allReviewers = [author, ...reviewers];

    const rating = this.ratingRepository.create({
      name: dto.name,
      type: dto.type,
      author,
      reviewers: allReviewers,
    });

    await this.ratingRepository.save(rating);


    const ratingItems = dto.items.map((item) =>
      this.ratingItemRepository.create({
        rating,
        name: item.name,
        maxScore: item.maxScore,
        comment: item.comment,
      }),
    );
    await this.ratingItemRepository.save(ratingItems);

    const participants = respondents.map((respondent) =>
      this.ratingParticipantRepository.create({
        rating,
        respondent,
      }),
    );
    await this.ratingParticipantRepository.save(participants);

    for (const participant of participants) {
      const responses = ratingItems.map((item) =>
        this.ratingResponseRepository.create({
          rating,
          item,
          respondent: participant.respondent,
          score: 0,
        }),
      );
      await this.ratingResponseRepository.save(responses);
    }

    for (const participant of participants) {
      const ratingApprovals = allReviewers.map((reviewer) =>
        this.ratingApprovalRepository.create({
          participant,
          reviewer,
          status: RatingApprovalStatus.PENDING,
          comments: {},
        })
      );
      await this.ratingApprovalRepository.save(ratingApprovals);
    }

    return { rating, ratingItems, participants };
  }

  async editRating(ratingId: number, authorId: number, dto: CreateRatingDto) {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['author', 'participants', "participants.respondent", 'reviewers', 'items'],
    });

    if (!rating) throw new NotFoundException('Рейтинг не знайдено');
    if (rating.author.id !== authorId) throw new ForbiddenException('Ви не є автором цього рейтингу');

    const respondents = await this.userRepository.findByIds(dto.respondentIds ?? []);
    if (respondents.length !== (dto.respondentIds?.length || 0)) {
      throw new BadRequestException('Один або більше респондентів не знайдено');
    }

    const reviewers = await this.userRepository.findByIds(dto.reviewerIds ?? []);
    if (reviewers.length !== (dto.reviewerIds?.length || 0)) {
      throw new BadRequestException('Один або більше рецензентів не знайдено');
    }

    const allReviewers = [rating.author, ...reviewers];

    rating.name = dto.name;
    rating.type = dto.type;
    rating.reviewers = allReviewers;

    await this.ratingRepository.save(rating);

    const existingParticipantIds = rating.participants.map(p => p.respondent.id);
    const newRespondentIds = new Set(dto.respondentIds);

    const participantsToRemove = rating.participants.filter(p => !newRespondentIds.has(p.respondent.id));
    if (participantsToRemove.length > 0) {
      await this.ratingParticipantRepository.remove(participantsToRemove);
    }

    const existingItemsMap = new Map(rating.items.map(i => [i.id, i]));

    for (const itemData of dto.items) {
      const existingItem = itemData.id ? existingItemsMap.get(itemData.id) : null;

      if (existingItem) {
        existingItem.name = itemData.name;
        existingItem.maxScore = itemData.maxScore;
        existingItem.comment = itemData.comment;
        await this.ratingItemRepository.save(existingItem);
      } else {
        const newItem = this.ratingItemRepository.create({
          rating,
          name: itemData.name,
          maxScore: itemData.maxScore,
          comment: itemData.comment,
        });
        await this.ratingItemRepository.save(newItem);

        for (const participant of rating.participants) {
          const response = this.ratingResponseRepository.create({
            rating,
            item: newItem,
            respondent: participant.respondent,
            score: 0,
          });
          await this.ratingResponseRepository.save(response);
        }
      }
    }
    const newItemIds = new Set(dto.items.filter(i => i.id).map(i => i.id));
    const itemsToRemove = rating.items.filter(i => !newItemIds.has(i.id));
    if (itemsToRemove.length > 0) {
      await this.ratingItemRepository.remove(itemsToRemove);
    }

    for (const respondent of respondents) {
      if (!existingParticipantIds.includes(respondent.id)) {
        const participant = this.ratingParticipantRepository.create({ rating, respondent });
        await this.ratingParticipantRepository.save(participant);

        for (const reviewer of allReviewers) {
          const approval = this.ratingApprovalRepository.create({
            participant,
            reviewer,
            status: RatingApprovalStatus.PENDING,
            comments: {},
          });
          await this.ratingApprovalRepository.save(approval);
        }
      }
    }

    return { message: 'Рейтинг оновлено' };
  }

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


  async getRatingDetails(ratingId: number) {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['author', 'reviewers', 'participants', 'participants.respondent', 'items'],
    });

    if (!rating) {
      throw new NotFoundException('Рейтинг не знайдено');
    }

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
      participants: rating.participants.map((participant) => ({
        id: participant.id,
        respondent: {
          id: participant.respondent.id,
          firstName: participant.respondent.firstName,
          lastName: participant.respondent.lastName,
          email: participant.respondent.email,
        },
      })),
      items: rating.items.map((item) => ({
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
      relations: ['rating', 'rating.items'],
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

    return { message: 'Рейтинг успішно заповнено' };
  }

  async getRatingForReview(ratingId: number, respondentId: number, reviewerId: number) {
    const participant = await this.ratingParticipantRepository.findOne({
      where: {
        rating: { id: ratingId },
        respondent: { id: respondentId },
      },
      relations: ['responses', 'rating.items', 'responses.documents', 'responses.item', 'approvals', 'respondent'],
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
      relations: ['approvals'],
    });

    if (!participant) throw new NotFoundException('Рейтинг не знайдено');

    const approval = await this.ratingApprovalRepository.findOne({
      where: { participant: { id: participant.id }, reviewer: { id: userId } },
    });

    if (!approval) {
      throw new ForbiddenException('Ви не є рецензентом цього рейтингу');
    }

    approval.status = dto.status;
    approval.comments = dto.comments || {};
    await this.ratingApprovalRepository.save(approval);

    return { success: true };
  }

  async getRatings() {
    return this.ratingRepository.find({ relations: ['author', 'participants', 'reviewers'] });
  }
}
