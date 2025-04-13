import { api } from './api';

export interface ReportGroup {
  name: string;
  totalParticipants: number;
  filledCount: number;
  approvedCount: number;
  revisionCount: number;
  pendingCount: number;
  averageScore: number;
  participants: {
    name: string;
    status: string;
    score: number;
    position?: string;
    degree?: string;
  }[];
}

export type GroupByType = 'department' | 'unit' | 'position' | 'scientificDegree';

export const getRatingReport = async (ratingId: number, groupBy?: GroupByType): Promise<ReportGroup[]> => {
  const params = new URLSearchParams();
  if (groupBy) {
    params.append('groupBy', groupBy);
  }
  
  const response = await api.get(`/ratings/report/${ratingId}?${params}`);
  return response.data;
};

export const downloadRatingReport = (ratingId: number, groupBy?: GroupByType): void => {
  const params = new URLSearchParams();
  if (groupBy) {
    params.append('groupBy', groupBy);
  }
  
  window.open(`${api.defaults.baseURL}/ratings/report/${ratingId}/pdf?${params}`, '_blank');
};