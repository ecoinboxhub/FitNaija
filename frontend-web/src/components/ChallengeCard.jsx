import React from 'react';

export default function ChallengeCard({ challenge, onSelect, onJoinToggle }) {
  return (
    <div className="bg-white border border-borderLight rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="bg-brand-light text-brand text-xs font-extrabold px-3 py-1 rounded-md uppercase tracking-wider">
            {challenge.category}
          </span>
          <span className="text-xs text-textMuted font-semibold flex items-center gap-1">
            <i data-lucide="users" className="w-3.5 h-3.5"></i> {challenge.participantsCount} joined
          </span>
        </div>

        <h3 className="text-xl font-bold font-serif text-textDark mb-2 leading-snug">{challenge.title}</h3>
        <p className="text-sm text-textMuted leading-relaxed mb-4">{challenge.description}</p>

        <div className="space-y-2 mt-4 pt-4 border-t border-borderLight">
          <div className="flex justify-between text-xs">
            <span className="text-textMuted font-medium">Complexity level</span>
            <span className="font-bold text-textDark">{challenge.difficulty}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-textMuted font-medium">Target Duration</span>
            <span className="font-bold text-textDark">{challenge.durationDays} Days</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-textMuted font-medium">Milestone XP Reward</span>
            <span className="font-bold text-brand">{challenge.xpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Card bottom actions */}
      <div className="px-6 py-4 bg-bgSoft border-t border-borderLight flex items-center justify-between gap-3">
        <button 
          onClick={onSelect}
          className="text-xs font-bold text-textDark hover:text-brand flex items-center gap-1.5"
        >
          <i data-lucide="bar-chart-2" className="w-4 h-4"></i> Leaderboard
        </button>
        
        <button 
          onClick={onJoinToggle}
          className={`text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            challenge.joined ? 'bg-textDark text-white hover:bg-brand' : 'bg-brand text-white hover:bg-brand-hover'
          }`}
        >
          {challenge.joined ? (
            <>
              <i data-lucide="check" className="w-3.5 h-3.5"></i> Active Commitment
            </>
          ) : (
            <>
              <i data-lucide="plus" className="w-3.5 h-3.5"></i> Commit Now
            </>
          )}
        </button>
      </div>

    </div>
  );
}
