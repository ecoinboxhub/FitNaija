import { initialChallenges, initialFeed, initialWorkoutLogs, userProfile } from '../data/mockData';

// Simulated DB States in local memory for demo reactivity
let localChallenges = [...initialChallenges];
let localFeed = [...initialFeed];
let localWorkoutLogs = [...initialWorkoutLogs];

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getChallenges = async () => {
  await delay();
  return [...localChallenges];
};

export const getChallenge = async (id) => {
  await delay();
  return localChallenges.find(c => c.id === id) || null;
};

export const joinChallenge = async (id) => {
  await delay();
  let status = false;
  localChallenges = localChallenges.map(c => {
    if (c.id === id) {
      status = !c.joined;
      return {
        ...c,
        joined: status,
        participantsCount: status ? c.participantsCount + 1 : c.participantsCount - 1
      };
    }
    return c;
  });
  return { success: true, joined: status };
};

export const getLeaderboard = async (id) => {
  await delay();
  const challenge = localChallenges.find(c => c.id === id);
  return challenge ? challenge.leaderboard : [];
};

export const getFeed = async () => {
  await delay();
  return [...localFeed];
};

export const submitWorkout = async (data) => {
  await delay(600);
  const newLog = {
    id: 'w_' + Date.now(),
    type: data.type,
    duration: parseInt(data.duration),
    notes: data.notes || `Completed intense ${data.type} routine!`,
    date: new Date().toISOString().split('T')[0],
    proof: data.proof
  };
  
  localWorkoutLogs = [newLog, ...localWorkoutLogs];

  // Add accountability log to the community feed
  const newFeedItem = {
    id: 'f_' + Date.now(),
    userName: 'You (Chidi)',
    userAvatar: userProfile.avatar,
    action: 'logged a workout',
    detail: `Logged a ${newLog.duration} mins ${newLog.type} session. Notes: "${newLog.notes}"`,
    time: 'Just now',
    cheers: 0,
    cheered: false,
    challenge: 'Personal Streak',
    type: 'workout'
  };
  localFeed = [newFeedItem, ...localFeed];

  return { success: true, log: newLog, feedItem: newFeedItem };
};

export const createPost = async (text) => {
  await delay();
  const newPost = {
    id: 'f_post_' + Date.now(),
    userName: 'You (Chidi)',
    userAvatar: userProfile.avatar,
    action: 'shared updates',
    detail: `“${text}”`,
    time: 'Just now',
    cheers: 0,
    cheered: false,
    challenge: 'General Chat',
    type: 'post'
  };
  localFeed = [newPost, ...localFeed];
  return { success: true, post: newPost };
};

export const toggleCheer = async (feedId) => {
  await delay(100);
  let updatedItem = null;
  localFeed = localFeed.map(item => {
    if (item.id === feedId) {
      updatedItem = {
        ...item,
        cheered: !item.cheered,
        cheers: item.cheered ? item.cheers - 1 : item.cheers + 1
      };
      return updatedItem;
    }
    return item;
  });
  return { success: true, item: updatedItem };
};

export const getProfile = async () => {
  await delay();
  const totalWorkouts = localWorkoutLogs.length;
  const totalDuration = localWorkoutLogs.reduce((acc, curr) => acc + curr.duration, 0);
  return {
    ...userProfile,
    stats: {
      totalWorkouts,
      totalDuration,
      completedCount: userProfile.completedCount
    },
    logs: [...localWorkoutLogs]
  };
};
