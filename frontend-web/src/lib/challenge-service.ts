import { api } from './api';

export interface LeaderboardEntry {
  name: string;
  avatar: string;
  score: number;
  rank: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  durationDays: number;
  startDate: string;
  participantsCount: number;
  entry_fee: number;
  prize_pool: number;
  location_scope: string;
  joined: boolean;
  xpReward: number;
  aiCoachTip: string;
  leaderboard: LeaderboardEntry[];
}

export interface JoinResponse {
  success: boolean;
  joined: boolean;
  payment_params?: { authorization_url: string; reference: string } | null;
}

export const challengeService = {
  list: async (location?: string) => {
    const params = location ? `?location=${encodeURIComponent(location)}` : '';
    return api.get<Challenge[]>(`/challenges${params}`);
  },

  get: async (id: string) => {
    return api.get<Challenge>(`/challenges/${id}`);
  },

  join: async (id: string) => {
    return api.post<JoinResponse>(`/challenges/${id}/join`);
  },

  leaderboard: async (id: string) => {
    return api.get<LeaderboardEntry[]>(`/challenges/${id}/leaderboard`);
  },
};
