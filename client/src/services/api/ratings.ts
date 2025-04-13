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

export const getAllRatings = async () => {
  const response = await api.get(`/ratings`);
  return response.data;
}

export const getClosedRatings = async () => {
  const response = await api.get(`/ratings/closed`);
  return response.data;
}

export const fillRespondentRating = async (ratingId: number) => {
  const response = await api.post(`/ratings/${ratingId}/respondent-fill-send`);
  return response.data;
};

export const completeRating = async (ratingId: number) => {
  const response = await api.post(`/ratings/${ratingId}/complete`);
  return response.data;
};

export const finalizeRating = async (ratingId: number) => {
  const response = await api.post(`/ratings/${ratingId}/finalize`);
  return response.data;
};
