export type Rating = {
    name: string;
    type: string;
    status: string;
    items: RatingItem[];
    id: number;
    author: number;
    respondents: number[];
    totalScore: number;
};

export type RatingItem = {
    id: number;
    name: string;
    maxScore: number;
    score: number;
    documents: File[];
};

export type RatingApproval = {
    ratingId: number;
    comments: Record<number, string>;
    status: "approved" | "revision";
}