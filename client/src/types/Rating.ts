import { Department } from "./Department";
import { User } from "./User";

export type Rating = {
    title: string;
    type: RatingType;
    status: string;
    id: number;
    author: number;
    participants: { 
        firstName: string;
        lastName: string;
        department: Department;
        approvalStatus: RatingApprovalStatus;
        participantStatus: RatingParticipantStatus;
        id: number;
        respondent: User;
        departmentReviewer?: User;
        unitReviewer?: User;
    }[];
    reviewers: User[];
    departmentReviewers?: User[];
    unitReviewers?: User[];
    items: RatingItem[];
    participantStatus: RatingParticipantStatus;
    date: string;
};

export type RatingItem = {
    id: number;
    name: string;
    maxScore: number;
    comment: string;
    score: number;
    documents: File[];
    isDocNeed: boolean;
    documentUrls?: string[];
};

export type RatingApproval = {
    ratingId: number;
    comments: Record<string, unknown>;
    status: RatingApprovalStatus;
};

export enum RatingParticipantStatus {
    PENDING = 'pending',
    FILLED = 'filled',
    APPROVED = 'approved',
    REVISION = 'revision',
  }
  
  export enum RatingStatus {
    CREATED = 'created',
    PENDING = 'pending',
    CLOSED = 'closed',
  }

  export enum RatingType {
    SCIENTIFIC = "Науковий",
    EDUCATIONAL_METHODICAL = "Навчально-методичний",
    ORGANIZATIONAL_EDUCATIONAL = "Організаційно-виховний"
  }
  
  export enum RatingApprovalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REVISION = 'revision',
  }
  
  export enum ReviewLevel {
    DEPARTMENT = 'department',
    UNIT = 'unit',
    AUTHOR = 'author',
  }