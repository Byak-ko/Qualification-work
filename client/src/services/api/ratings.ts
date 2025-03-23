import { api } from "./api";
import { Rating, RatingApproval } from "../../types/Rating";

export const getRatingById = (id: number) =>
  api.get<Rating>(`/ratings/${id}/review`);
export const submitReview = (id: number, payload: RatingApproval) =>
  api.post(`/ratings/${id}/review`, payload);

export const updateItemComment = (itemId: number, comment: string) =>
  api.patch(`/ratings/items/${itemId}/comment`, { comment });
