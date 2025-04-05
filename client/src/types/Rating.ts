import { RatingParticipantStatus } from "./RatingTypes";
import { User } from "./User";

export type Rating = {
    name: string;
    type: string;
    status: string;
    id: number;
    author: number;
    participants: { 
        respondent: User;
        departmentReviewer?: User;
        unitReviewer?: User;
    }[];
    reviewers: User[];
    departmentReviewers?: User[];
    unitReviewers?: User[];
    items: RatingItem[];
    participantStatus: RatingParticipantStatus;
};

export type RatingItem = {
    id: number;
    name: string;
    maxScore: number;
    comment: string;
    score: number;
    documents: File[];
    isDocNeed: boolean;
};

export type RatingApproval = {
    ratingId: number;
    comments: Record<string, unknown>;
    status: "pending" | "approved" | "revision";
};