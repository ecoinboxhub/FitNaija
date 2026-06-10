import React from 'react';
import Leaderboard from './Leaderboard';

export default function ChallengeDetail({ challenge, onBack, onJoinToggle }) {
  return (
    <div className="bg-white border border-borderLight rounded-xl p-6 md:p-8 shadow-xs">
      
      {/* Back button */}
      <button 
        onClick={onBack}
        className="text-xs font-bold text-brand hover:underline flex items-center gap-1.5 mb-6"
      >
        <i data-lucide="arrow-left" className="w-4 h-4"></i> Return to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Challenge Overview & Advice */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <span className="bg-brand-light text-brand text-[10px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wider mb-2.5 inline-block">
              {challenge.category}
            </span>
            <h2 className="text-3xl font-serif font-bold text-textDark leading-tight mb-3">
              {challenge.title}
            </h2>
            <p className="text-sm text-textMuted leading-relaxed">
              {challenge.description}
            </p>
          </div>

          <div className="p-4 bg-bgSoft rounded-xl border border-borderLight">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-brand mb-2 flex items-center gap-1.5">
              <i data-lucide="bot" className="w-4 h-4"></i> AI Coach Guidance
            </h4>
            <p className="text-xs italic text-textDark leading-relaxed">
              &ldquo;{challenge.aiCoachTip}&rdquo;
            </p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-borderLight">
            <div className="flex justify-between text-xs">
              <span className="text-textMuted font-medium">Difficulty Profile</span>
              <span className="font-bold text-textDark">{challenge.difficulty}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-textMuted font-medium">Active Competitors</span>
              <span className="font-bold text-textDark">{challenge.participantsCount} professionals</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-textMuted font-medium">Total Rewards potential</span>
              <span className="font-bold text-brand">{challenge.xpReward} XP</span>
            </div>
          </div>

          <button 
            onClick={() => onJoinToggle(challenge.id)}
            className={`w-full py-3 rounded-lg text-sm font-bold transition-all ${
              challenge.joined ? 'bg-textDark text-white hover:bg-brand' : 'bg-brand text-white hover:bg-brand-hover'
            }`}
          >
            {challenge.joined ? 'Cancel Commitment' : 'Join Challenge Arena'}
          </button>
        </div>

        {/* Leaderboard Entries Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-serif text-textDark">Arena Leaderboard</h3>
            <span className="text-xs text-textMuted font-semibold uppercase tracking-wider">Metrics: Active XP / Speed Log</span>
          </div>

          <Leaderboard leaderboard={challenge.leaderboard || []} />
        </div>

      </div>
    </div>
  );
}
