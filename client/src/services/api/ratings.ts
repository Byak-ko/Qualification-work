import { api } from "./api";
import { RatingApproval } from "../../types/Rating";

export const getRatingForReview = async (ratingId: number, respondentId: number) => {
  const response = await api.get(`/ratings/${ratingId}/review/${respondentId}`);
  return response.data;
};

export const submitReview = async (ratingId: number, respondentId: number, payload: RatingApproval) => {
  const response = await api.post(`/ratings/${ratingId}/review/${respondentId}`, payload);
  return response.data;
};

export const getRatingsByUserId = async () => {
  const response = await api.get(`/ratings/user`);
  return response.data;
};


