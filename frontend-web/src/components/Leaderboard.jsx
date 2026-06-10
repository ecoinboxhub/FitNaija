import React from 'react';

export default function Leaderboard({ leaderboard = [] }) {
  return (
    <div className="border border-borderLight rounded-xl overflow-hidden bg-bgSoft">
      <div className="p-4 bg-white border-b border-borderLight flex justify-between text-xs font-bold text-textMuted">
        <span>Participant Name</span>
        <span>Score Intensity</span>
      </div>

      <div className="divide-y divide-borderLight">
        {leaderboard.length === 0 ? (
          <div className="p-8 text-center text-xs text-textMuted bg-white">No leaderboard entries found.</div>
        ) : (
          leaderboard.map((item, index) => (
            <div 
              key={index} 
              className={`p-4 flex justify-between items-center bg-white hover:bg-bgSoft transition-colors ${
                item.name.includes('You') ? 'bg-brand-light/40 border-l-4 border-brand' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center text-sm font-extrabold ${
                  index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-textMuted'
                }`}>
                  {index + 1}
                </span>
                <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-full object-cover border border-borderLight" />
                <span className="text-sm font-bold text-textDark">{item.name}</span>
              </div>
              <span className="text-sm font-extrabold text-brand">
                {item.score} <span className="text-[10px] text-textMuted font-semibold">pts</span>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
