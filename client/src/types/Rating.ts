import { User } from "./User";

export type Rating = {
    name: string;
    type: string;
    status: string;
    id: number;
    author: number;
    participants: { respondent: User }[];
    reviewers: User[];
    items: RatingItem[];
};

export type RatingItem = {
    id: number;
    name: string;
    maxScore: number;
    comment: string;
    score: number;
    documents: File[]
};

export type RatingApproval = {
    ratingId: number;
    comments: Record<number, string>;
    status: "pending" | "approved" | "revision" ;
}