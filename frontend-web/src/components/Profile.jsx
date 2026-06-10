import React from 'react';

export default function Profile({ profile, logs }) {
  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Left Column: Avatar & Summary stats */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white border border-borderLight p-6 rounded-xl text-center shadow-xs">
          <img 
            src={profile.avatar} 
            alt={profile.name} 
            className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-brand-light shadow-md mb-4" 
          />
          <h3 className="text-xl font-bold font-serif text-textDark mb-1">{profile.name}</h3>
          <p className="text-xs text-textMuted font-semibold leading-relaxed mb-4">
            {profile.role}
          </p>
          
          <div className="bg-bgSoft p-3.5 rounded-lg border border-borderLight inline-block">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-textMuted block mb-0.5">Title Rank</span>
            <span className="text-brand font-bold text-sm">{profile.level}</span>
          </div>
        </div>

        <div className="bg-white border border-borderLight p-5 rounded-xl shadow-xs">
          <h4 className="font-bold text-textDark font-serif text-sm mb-3">Accountability Quick Data</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-textMuted font-medium">Active XP Points</span>
              <span className="font-bold text-textDark">{profile.xp} XP</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-textMuted font-medium">Platform Log count</span>
              <span className="font-bold text-textDark">{profile.stats?.totalWorkouts || 0} logged</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-textMuted font-medium">Completed Milestones</span>
              <span className="font-bold text-textDark">{profile.completedCount} challenges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Completed Challenges & Detailed Logs */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Logged History List */}
        <div className="bg-white border border-borderLight p-6 rounded-xl shadow-xs">
          <h3 className="text-lg font-bold font-serif text-textDark mb-4">Full Logged History</h3>
          
          {logs.length === 0 ? (
            <p className="text-xs text-textMuted italic">No history logged yet.</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="p-4 bg-bgSoft rounded-lg border border-borderLight flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-brand/10 text-brand text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        {log.type}
                      </span>
                      <span className="text-xs text-textDark font-bold">{log.duration} minutes logged</span>
                    </div>
                    <p className="text-xs text-textDark mt-1.5 font-medium">&ldquo;{log.notes}&rdquo;</p>
                    <span className="text-[10px] text-textMuted mt-1 block">Uploaded: {log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Arena Challenges */}
        <div className="bg-white border border-borderLight p-6 rounded-xl shadow-xs">
          <h3 className="text-lg font-bold font-serif text-textDark mb-4">Completed Accountability Runs ({profile.completedCount})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-bgSoft border border-borderLight rounded-lg">
              <span className="text-brand text-xs font-bold block mb-1">May 2026</span>
              <h4 className="font-bold text-sm text-textDark">Central Area Fast Walk 10K</h4>
              <span className="text-[10px] text-textMuted font-medium block">Achieved 400 XP</span>
            </div>
            <div className="p-4 bg-bgSoft border border-borderLight rounded-lg">
              <span className="text-brand text-xs font-bold block mb-1">April 2026</span>
              <h4 className="font-bold text-sm text-textDark">Jabi Lake Sprint Marathon</h4>
              <span className="text-[10px] text-textMuted font-medium block">Achieved 500 XP</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
