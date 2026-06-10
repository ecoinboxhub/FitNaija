export const initialChallenges = [
  {
    id: 'c1',
    title: 'Maitama Morning Run Club',
    description: 'Wake up early and conquer 5K runs around Maitama Hills. Track consistency and speed with professional accountability.',
    difficulty: 'Intermediate',
    category: 'Running',
    durationDays: 21,
    entry_fee: 0,
    prize_pool: 0,
    location_scope: 'Maitama',
    startDate: '2026-06-01',
    participantsCount: 84,
    joined: true,
    xpReward: 350,
    aiCoachTip: 'Focus on breathing control and keeping a steady cadence when going up the Maitama hills.',
    leaderboard: [
      { name: 'Emeka N.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', score: 75.2, rank: 1 },
      { name: 'Amina Y.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', score: 68.5, rank: 2 },
      { name: 'Abubakar M.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', score: 62.0, rank: 3 },
      { name: 'You (Chidi)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', score: 45.8, rank: 4 },
    ]
  },
  {
    id: 'c2',
    title: 'Wuse II Strength & Tone',
    description: 'A strength training routine targeting full-body muscle development, tailored for busy executives who frequent fitness spaces in Wuse.',
    difficulty: 'Advanced',
    category: 'Strength',
    durationDays: 30,
    entry_fee: 15000,
    prize_pool: 500000,
    location_scope: 'Wuse',
    startDate: '2026-06-05',
    participantsCount: 128,
    joined: false,
    xpReward: 500,
    aiCoachTip: 'Prioritize structural movements like compound lifts, maintaining optimal recovery periods between sets.',
    leaderboard: [
      { name: 'Kelechi O.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', score: 1200, rank: 1 },
      { name: 'Zainab A.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', score: 980, rank: 2 },
      { name: 'Femi S.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150', score: 850, rank: 3 },
    ]
  },
  {
    id: 'c3',
    title: 'Garki Corporate Calorie Burn',
    description: 'High-intensity interval training designed to squeeze physical movement into demanding professional lives based in Garki offices.',
    difficulty: 'Beginner',
    category: 'HIIT',
    durationDays: 14,
    entry_fee: 0,
    prize_pool: 0,
    location_scope: 'Garki',
    startDate: '2026-06-10',
    participantsCount: 215,
    joined: true,
    xpReward: 250,
    aiCoachTip: 'Keep active desk stretches going during work hours to enhance recovery and maintain circulation.',
    leaderboard: [
      { name: 'Tunde B.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150', score: 4800, rank: 1 },
      { name: 'You (Chidi)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', score: 3200, rank: 2 },
      { name: 'Ngozi E.', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=150', score: 2900, rank: 3 },
    ]
  },
  {
    id: 'c4',
    title: 'Jabi Lake Yoga & Mindfulness',
    description: 'Weekend sessions focused on holistic mental clarity, breathing practices, and flexibility routines beside Jabi Lake.',
    difficulty: 'Beginner',
    category: 'Yoga',
    durationDays: 28,
    entry_fee: 0,
    prize_pool: 0,
    location_scope: 'Jabi',
    startDate: '2026-06-15',
    participantsCount: 92,
    joined: false,
    xpReward: 200,
    aiCoachTip: 'Focus intensely on inhaling deeply, using the lake ambient atmosphere to release stress hormones.',
    leaderboard: [
      { name: 'Chioma A.', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=150', score: 150, rank: 1 },
      { name: 'Tariq U.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', score: 120, rank: 2 },
    ]
  }
];

export const initialFeed = [
  { id: 'f1', userName: 'Amina Y.', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', action: 'logged a running workout', detail: '5.2 km at Maitama Hills in 28 mins.', time: '2 hours ago', cheers: 14, cheered: false, challenge: 'Maitama Morning Run Club', type: 'workout' },
  { id: 'f2', userName: 'Abubakar M.', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', action: 'completed a milestone', detail: 'Achieved 7 consecutive days of workouts!', time: '4 hours ago', cheers: 29, cheered: true, challenge: 'Maitama Morning Run Club', type: 'milestone' },
  { id: 'f3', userName: 'Kelechi O.', userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150', action: 'shared encouragement', detail: '"Abuja professionals! Let\'s keep moving today. Work is long, but fitness keeps the body ready!"', time: '6 hours ago', cheers: 42, cheered: false, challenge: 'Wuse II Strength & Tone', type: 'post' }
];

export const initialWorkoutLogs: Array<{
  id: string; type: string; duration: number; notes: string; date: string; proof: string | null;
}> = [
  { id: 'w1', type: 'Running', duration: 45, notes: 'Completed 6km trail around Jabi Lake early morning.', date: '2026-05-28', proof: null },
  { id: 'w2', type: 'Strength', duration: 60, notes: 'High volume push day at the gym in Wuse II.', date: '2026-05-26', proof: null },
  { id: 'w3', type: 'HIIT', duration: 30, notes: 'Quick home HIIT before going to the secretariat in Central Area.', date: '2026-05-24', proof: null }
];

export const userProfile = {
  name: 'Chidi A.',
  role: 'Consultant, Central Business District',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  completedCount: 4,
  xp: 1420,
  level: 'Pro Activist',
};
