jest.mock('src/entities/rating-participant.entity', () => ({
  ParticipantStatus: {
    PENDING: 'pending',
    FILLED: 'filled',
    REVIEW: 'review',
    APPROVED: 'approved',
    REVISION: 'revision'
  },
  RatingParticipant: class RatingParticipant {
    id: number;
    rating: any;
    user: any;
    status: string;
    responses: any[];
    approvals: any[];
    totalScore: number;
  }
}));

jest.mock('src/entities/rating-response.entity', () => ({
  RatingResponse: class RatingResponse {
    id: number;
    item: any;
    participant: any;
    user: any;
    score: number;
    documents: string[];
  }
}));

jest.mock('src/entities/rating-approval.entity', () => ({
  RatingApprovalStatus: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REVISION: 'revision'
  },
  ReviewLevel: {
    DEPARTMENT: 'department',
    FACULTY: 'faculty',
    UNIVERSITY: 'university'
  },
  RatingApproval: class RatingApproval {
    id: number;
    participant: any;
    reviewer: any;
    status: string;
    reviewLevel: string;
    comments: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
  }
}));

jest.mock('src/entities/rating-item.entity', () => ({
  RatingItem: class RatingItem {
    id: number;
    rating: any;
    name: string;
    maxScore: number;
    comment: string;
    isDocNeed: boolean;
    responses: any[];
  }
}));

import { Test, TestingModule } from '@nestjs/testing';
import { RatingController } from './controllers/rating.controller';
import { RatingResponseController } from './controllers/rating-response.controller';
import { RatingReviewController } from './controllers/rating-review.controller';
import { RatingFinalizationController } from './controllers/rating-finalization.controller';
import { DocumentController } from './controllers/document.controller';
import { RatingReportController } from './controllers/rating-report.controller';
import { RatingService } from './services/rating.service';
import { RatingCreationService } from './services/rating-creation.service';
import { DocumentService } from './services/document.service';
import { RatingReportService } from './services/rating-report.service';
import { NotFoundException, ForbiddenException, BadRequestException, UseInterceptors } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingApprovalDto, RatingApprovalCommentsDto} from './dto/rating-approval.dto';
import { RatingApprovalStatus } from '../entities/rating-approval.entity';
import { Rating, RatingStatus, RatingType } from '../entities/rating.entity';
import { UserRole, Degree, User, Position } from 'src/entities/user.entity'; 
import { Unit, UnitType } from 'src/entities/unit.entity';
import { Request } from 'express';

describe('Ratings Controllers (Unit)', () => {
  let ratingController: RatingController;
  let ratingResponseController: RatingResponseController;
  let ratingReviewController: RatingReviewController;
  let ratingFinalizationController: RatingFinalizationController;
  let documentController: DocumentController;
  let ratingReportController: RatingReportController;

  let mockRatingService: Partial<RatingService>;
  let mockRatingCreationService: Partial<RatingCreationService>;
  let mockDocumentService: Partial<DocumentService>;
  let mockRatingReportService: Partial<RatingReportService>;

  const mockRating: Rating = {
    id: 1,
    title: 'Test Rating',
    type: RatingType.SCIENTIFIC,
    author: { id: 1, email: 'author@example.com', firstName: 'Author', lastName: 'User', role: UserRole.TEACHER, password: '', degree: Degree.NONE, position: Position.LECTURER, isAuthor: true, department: { id: 1, name: 'Test Department', users: [], unit: { id: 1, name: 'Test Unit', type: UnitType.FACULTY, departments: [] }}, ratingsAuthor: [], ratingParticipations: [], ratingsToReview: [], givenApprovals: [], responses: [] },
    endedAt: new Date(),
    status: RatingStatus.CREATED,
    participants: [],
    items: [],
    reviewers: [],
  };

  const createMockRequest = (userData: any, params?: any): Request => {
    const req = {
      user: userData,
      params: params || {},
      get: jest.fn(),
      header: jest.fn(),
      accepts: jest.fn(),
      acceptsCharsets: jest.fn(),
    } as unknown as Request;
    
    return req;
  };
  
  beforeEach(async () => {
    mockRatingService = {
      getAllRatings: jest.fn().mockResolvedValue([mockRating]),
      getRatingsByUserId: jest.fn().mockResolvedValue([mockRating]),
      getClosedRatings: jest.fn().mockResolvedValue([mockRating]),
      createRating: jest.fn().mockResolvedValue(mockRating),
      getRatingDetails: jest.fn().mockResolvedValue(mockRating),
      editRating: jest.fn().mockResolvedValue(mockRating),
      getParticipantApprovals: jest.fn().mockResolvedValue([{ reviewLevel: 'department', comments: {} } as RatingApprovalCommentsDto]),
      submitRating: jest.fn().mockResolvedValue(mockRating),
      getRatingForRespondent: jest.fn().mockResolvedValue(mockRating),
      fillRating: jest.fn().mockResolvedValue({ message: 'Рейтинг успішно заповнено' }),
      fillCompleteRating: jest.fn().mockResolvedValue({ message: 'Рейтинг відправлено на перевірку' }),
      getRatingForReview: jest.fn().mockResolvedValue(mockRating),
      reviewRating: jest.fn().mockResolvedValue({ message: 'Рейтинг успішно рецензовано' }),
    };

    mockRatingCreationService = {
      finalizeRating: jest.fn().mockResolvedValue(mockRating),
    };

    const mockDocument = { id: 'doc1', url: 'doc1.pdf' };
    
    mockDocumentService = {
      uploadDocument: jest.fn().mockResolvedValue(mockDocument),
      getDocument: jest.fn().mockResolvedValue(mockDocument),
      deleteAllRatingDocuments: jest.fn().mockResolvedValue({ message: 'Документи успішно видалено' }),
    };

    mockRatingReportService = {
      generateReport: jest.fn().mockResolvedValue([
        {
          name: 'Test Report',
          totalParticipants: 10,
          filledCount: 8,
          approvedCount: 6,
          revisionCount: 2,
          pendingCount: 2,
          averageScore: 85,
          participants: [{ name: 'User', status: 'approved', score: 90, position: 'LECTURER', scientificDegree: 'PhD' }],
        },
      ]),
      generatePdfReport: jest.fn().mockResolvedValue(Buffer.from('PDF content')),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        RatingController,
        RatingResponseController,
        RatingReviewController,
        RatingFinalizationController,
        DocumentController,
        RatingReportController,
      ],
      providers: [
        { provide: RatingService, useValue: mockRatingService },
        { provide: RatingCreationService, useValue: mockRatingCreationService },
        { provide: DocumentService, useValue: mockDocumentService },
        { provide: RatingReportService, useValue: mockRatingReportService },
      ],
    }).compile();

    ratingController = module.get<RatingController>(RatingController);
    ratingResponseController = module.get<RatingResponseController>(RatingResponseController);
    ratingReviewController = module.get<RatingReviewController>(RatingReviewController);
    ratingFinalizationController = module.get<RatingFinalizationController>(RatingFinalizationController);
    documentController = module.get<DocumentController>(DocumentController);
    ratingReportController = module.get<RatingReportController>(RatingReportController);
  });

  describe('RatingController', () => {
    it('should get all ratings', async () => {
      const result = await ratingController.getAllRatings();
      expect(result).toEqual([mockRating]);
      expect(mockRatingService.getAllRatings).toHaveBeenCalled();
    });

    it('should get ratings by user id', async () => {
      const req = createMockRequest({ id: 1 });
      const result = await ratingController.getRatingsByUserId(req);
      expect(result).toEqual([mockRating]);
      expect(mockRatingService.getRatingsByUserId).toHaveBeenCalledWith(req.user.id);
    });

    it('should get closed ratings', async () => {
      const result = await ratingController.getClosedRatings();
      expect(result).toEqual([mockRating]);
      expect(mockRatingService.getClosedRatings).toHaveBeenCalled();
    });

    it('should create a new rating', async () => {
      const dto: CreateRatingDto = {
        title: 'New Rating',
        type: RatingType.SCIENTIFIC,
        respondentIds: [2, 3],
        items: [{ name: 'Item 1', maxScore: 10, comment: 'Test', isDocNeed: false }],
        endedAt: new Date(),
      };
      const req = createMockRequest({ id: 1 });
      const result = await ratingController.createRating(dto, req);
      expect(result).toEqual({ message: 'Рейтинг успішно створено', ...mockRating });
      expect(mockRatingService.createRating).toHaveBeenCalledWith(1, dto);
    });

    it('should get rating details by id', async () => {
      const result = await ratingController.getRatingDetails(1);
      expect(result).toEqual(mockRating);
      expect(mockRatingService.getRatingDetails).toHaveBeenCalledWith(1);
    });

    it('should update a rating', async () => {
      const dto: CreateRatingDto = {
        title: 'Updated Rating',
        type: RatingType.SCIENTIFIC,
        respondentIds: [2, 3],
        items: [{ name: 'Item 1', maxScore: 10, comment: 'Test', isDocNeed: false }],
        endedAt: new Date(),
      };
      const req = createMockRequest({ id: 1 });
      const result = await ratingController.updateRating(1, req, dto);
      expect(result).toEqual(mockRating);
      expect(mockRatingService.editRating).toHaveBeenCalledWith(1, 1, dto);
    });

    it('should throw NotFoundException when updating non-existent rating', async () => {
      if (mockRatingService.editRating) {
        (mockRatingService.editRating as jest.Mock).mockRejectedValue(new NotFoundException('Рейтинг не знайдений'));
      }
      const dto: CreateRatingDto = { 
        title: 'Test', 
        type: RatingType.SCIENTIFIC,
        respondentIds: [], 
        items: [], 
        endedAt: new Date() 
      };
      const req = createMockRequest({ id: 1 });
      await expect(ratingController.updateRating(999, req, dto)).rejects.toThrow(NotFoundException);
    });

    it('should get participant approvals', async () => {
      const result = await ratingController.getParticipantApprovals(1);
      expect(result).toEqual([{ reviewLevel: 'department', comments: {} }]);
      expect(mockRatingService.getParticipantApprovals).toHaveBeenCalledWith(1);
    });

    it('should submit a rating', async () => {
      const result = await ratingController.submitRating(1);
      expect(result).toEqual(mockRating);
      expect(mockRatingService.submitRating).toHaveBeenCalledWith(1);
    });
  });

  describe('RatingResponseController', () => {
    it('should get rating for respondent', async () => {
      const req = createMockRequest({ id: 1 });
      const result = await ratingResponseController.getRatingForRespondent(1, req);
      expect(result).toEqual(mockRating);
      expect(mockRatingService.getRatingForRespondent).toHaveBeenCalledWith(1, 1);
    });

    it('should fill rating', async () => {
      const req = createMockRequest({ id: 1 });
      const dto = {
        items: [{ id: 1, score: 5, documents: ['doc1.pdf'] }],
      };
      const result = await ratingResponseController.fillRating(1, req, dto);
      expect(result).toEqual({ message: 'Рейтинг успішно заповнено' });
      expect(mockRatingService.fillRating).toHaveBeenCalledWith(1, 1, dto);
    });

    it('should complete filling rating', async () => {
      const req = createMockRequest({ id: 1 });
      const result = await ratingResponseController.fillCompleteRating(1, req);
      expect(result).toEqual({ message: 'Рейтинг відправлено на перевірку' });
      expect(mockRatingService.fillCompleteRating).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('RatingReviewController', () => {
    it('should get rating for review', async () => {
      const req = createMockRequest({ id: 1 });
      const result = await ratingReviewController.getRatingForReview(1, 2, req);
      expect(result).toEqual(mockRating);
      expect(mockRatingService.getRatingForReview).toHaveBeenCalledWith(1, 2, 1);
    });

    it('should review rating', async () => {
      const req = createMockRequest({ id: 1 }, { respondentId: '2' });
      const dto: RatingApprovalDto = { 
        ratingId: 1, 
        status: RatingApprovalStatus.APPROVED,
        comments: {} 
      };
      const result = await ratingReviewController.reviewRating(1, dto, req);
      expect(result).toEqual({ message: 'Рейтинг успішно рецензовано' });
      expect(mockRatingService.reviewRating).toHaveBeenCalledWith(1, dto, 1, 2);
    });
  });

  describe('RatingFinalizationController', () => {
    it('should finalize rating', async () => {
      const result = await ratingFinalizationController.finalizeRating(1);
      expect(result).toEqual(mockRating);
      expect(mockRatingCreationService.finalizeRating).toHaveBeenCalledWith(1);
    });
  });

  describe('DocumentController', () => {
    it('should upload document', async () => {
      const file = { buffer: Buffer.from('file content'), originalname: 'doc.pdf' } as any;
      const result = await documentController.uploadDocument(file);
      expect(result).toEqual({ id: 'doc1', url: 'doc1.pdf' });
      expect(mockDocumentService.uploadDocument).toHaveBeenCalledWith(file);
    });

    it('should get document by id', async () => {
      const result = await documentController.getDocument('doc1');
      expect(result).toEqual({ id: 'doc1', url: 'doc1.pdf' });
      expect(mockDocumentService.getDocument).toHaveBeenCalledWith('doc1');
    });

    it('should throw NotFoundException for non-existent document', async () => {
      if (mockDocumentService.getDocument) {
        (mockDocumentService.getDocument as jest.Mock).mockResolvedValue(null);
      }
      await expect(documentController.getDocument('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should delete all rating documents', async () => {
      const result = await documentController.deleteAllRatingDocuments(1);
      expect(result).toEqual({ message: 'Документи успішно видалено' });
      expect(mockDocumentService.deleteAllRatingDocuments).toHaveBeenCalledWith(1);
    });
  });

  describe('RatingReportController', () => {
    it('should generate report', async () => {
      const result = await ratingReportController.getReport(1, 'department');
      expect(result).toEqual([
        {
          name: 'Test Report',
          totalParticipants: 10,
          filledCount: 8,
          approvedCount: 6,
          revisionCount: 2,
          pendingCount: 2,
          averageScore: 85,
          participants: [{ name: 'User', status: 'approved', score: 90, position: 'LECTURER', scientificDegree: 'PhD' }],
        },
      ]);
      expect(mockRatingReportService.generateReport).toHaveBeenCalledWith(1, 'department');
    });

    it('should generate PDF report', async () => {
      const res = { set: jest.fn(), end: jest.fn() } as any;
      await ratingReportController.getPdfReport(res, 1, 'department');
      expect(mockRatingReportService.generatePdfReport).toHaveBeenCalledWith(1, 'department');
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rating-report-1.pdf"`,
        'Content-Length': expect.any(Number),
      });
      expect(res.end).toHaveBeenCalledWith(expect.any(Buffer));
    });
  });
});