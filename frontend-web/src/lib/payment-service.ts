import { api } from './api';

export const paymentService = {
  initialize: async (challengeId: string) => {
    return api.post<{
      success: boolean;
      authorization_url: string;
      reference: string;
    }>('/payments/initialize', { challenge_id: challengeId });
  },

  verify: async (reference: string) => {
    return api.post<{
      success: boolean;
      status: string;
      amount: number;
    }>('/payments/verify', { reference });
  },
};
