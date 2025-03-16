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