import { api } from './api';

export interface WorkoutLog {
  id: string;
  type: string;
  duration: number;
  notes: string;
  date: string;
  proof: string | null;
  is_verified?: boolean;
  fraud_score?: number;
}

export interface WorkoutResponse {
  success: boolean;
  log: WorkoutLog;
  is_verified: boolean;
  feedItem?: {
    id: string;
    userName: string;
    action: string;
    detail: string;
    time: string;
    cheers: number;
  };
}

export const workoutService = {
  sync: async (data: { type: string; duration: number; notes?: string; proof?: string | null }) => {
    return api.post<WorkoutResponse>('/activity/sync', data);
  },
};
