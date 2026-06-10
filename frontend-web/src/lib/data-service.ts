import { challengeService, type Challenge, type LeaderboardEntry, type JoinResponse } from './challenge-service';
import { authService } from './auth-service';
import { workoutService, type WorkoutResponse } from './workout-service';
import {
  initialChallenges,
  initialFeed,
  initialWorkoutLogs,
  userProfile as mockProfile,
} from './mock-data';

let localChallenges = [...initialChallenges.map(c => ({ ...c, joined: c.id === 'c1' || c.id === 'c3' }))];
let localFeed = [...initialFeed];
let localWorkoutLogs = [...initialWorkoutLogs];
const localProfile = { ...mockProfile };

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

type ServiceMode = 'backend' | 'mock';

let mode: ServiceMode = 'backend';

async function tryBackend<T>(fn: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (mode === 'mock') return fallback();
  try {
    const result = await fn();
    mode = 'backend';
    return result;
  } catch {
    mode = 'mock';
    return fallback();
  }
}

export const dataService = {
  getChallenges: async (location?: string): Promise<Challenge[]> =>
    tryBackend(
      () => challengeService.list(location),
      async () => {
        await delay();
        let list = [...localChallenges];
        if (location) list = list.filter(c => c.location_scope?.toLowerCase() === location.toLowerCase());
        return list;
      }
    ),

  getChallenge: async (id: string): Promise<Challenge | null> =>
    tryBackend(
      () => challengeService.get(id),
      async () => {
        await delay();
        return localChallenges.find(c => c.id === id) || null;
      }
    ),

  joinChallenge: async (id: string): Promise<JoinResponse> =>
    tryBackend(
      () => challengeService.join(id),
      async () => {
        await delay();
        let joined = false;
        localChallenges = localChallenges.map(c => {
          if (c.id === id) {
            joined = !c.joined;
            return { ...c, joined, participantsCount: joined ? c.participantsCount + 1 : c.participantsCount - 1 };
          }
          return c;
        });
        return { success: true, joined };
      }
    ),

  getLeaderboard: async (id: string): Promise<LeaderboardEntry[]> =>
    tryBackend(
      () => challengeService.leaderboard(id),
      async () => {
        await delay();
        const challenge = localChallenges.find(c => c.id === id);
        return challenge ? challenge.leaderboard : [];
      }
    ),

  submitWorkout: async (data: { type: string; duration: number; notes?: string; proof?: string | null }): Promise<WorkoutResponse> =>
    tryBackend(
      () => workoutService.sync(data),
      async () => {
        await delay(600);
        const newLog = {
          id: 'w_' + Date.now(),
          type: data.type,
          duration: data.duration,
          notes: data.notes || `Completed intense ${data.type} routine!`,
          date: new Date().toISOString().split('T')[0],
          proof: data.proof || null,
          is_verified: true,
        };
        localWorkoutLogs = [newLog, ...localWorkoutLogs];
        const feedItem = {
          id: 'f_' + Date.now(), userName: 'You (Chidi)', userAvatar: localProfile.avatar,
          action: 'logged a workout', detail: `Logged a ${newLog.duration} mins ${newLog.type} session.`,
          time: 'Just now', cheers: 0, cheered: false, challenge: 'Personal Streak', type: 'workout',
        };
        localFeed = [feedItem, ...localFeed];
        return { success: true, log: newLog, is_verified: true, feedItem };
      }
    ),

  getFeed: async (): Promise<any[]> =>
    tryBackend(
      async () => { await delay(); return []; },
      async () => { await delay(); return [...localFeed]; }
    ),

  toggleCheer: async (feedId: string) => {
    await delay(100);
    let updated = null;
    localFeed = localFeed.map(item => {
      if (item.id === feedId) {
        updated = { ...item, cheered: !item.cheered, cheers: item.cheered ? item.cheers - 1 : item.cheers + 1 };
        return updated;
      }
      return item;
    });
    return { success: true, item: updated };
  },

  createPost: async (text: string) => {
    await delay();
    const post = { id: 'f_' + Date.now(), userName: 'You (Chidi)', userAvatar: localProfile.avatar,
      action: 'shared updates', detail: `"${text}"`, time: 'Just now', cheers: 0, cheered: false,
      challenge: 'General Chat', type: 'post' };
    localFeed = [post, ...localFeed];
    return { success: true, post };
  },

  getProfile: async () => {
    await delay();
    const totalWorkouts = localWorkoutLogs.length;
    const totalDuration = localWorkoutLogs.reduce((acc, cur) => acc + cur.duration, 0);
    return { ...localProfile, stats: { totalWorkouts, totalDuration, completedCount: localProfile.completedCount }, logs: [...localWorkoutLogs] };
  },

  sendOtp: (phone: string) => authService.sendOtp(phone).catch(() => { return { success: true, message: 'OTP sent (mock)' }; }),
  verifyOtp: (phone: string, otp: string) => authService.verifyOtp(phone, otp).catch(() => {
    if (otp !== '1234' && otp !== '123456') throw new Error('Invalid OTP');
    return { access_token: 'mock-token', refresh_token: 'mock-refresh', user: { id: '1', phone, display_name: 'Chidi A.', location: 'Maitama', bank_name: null, bank_account_number: null } };
  }),
  googleSignIn: (idToken: string) => authService.googleSignIn(idToken).catch(() => {
    return { access_token: 'mock-token', refresh_token: 'mock-refresh', status: 'trial_active' };
  }),
};
