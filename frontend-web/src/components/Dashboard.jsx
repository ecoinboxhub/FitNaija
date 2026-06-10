import React from 'react';

export default function Dashboard({ 
  profile, 
  activeChallenges, 
  workoutLogs, 
  recentFeed, 
  setCurrentTab, 
  setSelectedChallengeId, 
  onToggleCheer 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Progress & Quick Actions */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Progress Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-white border border-borderLight p-5 rounded-xl shadow-xs">
            <span className="text-textMuted text-xs font-semibold uppercase tracking-wider block mb-1">XP Level</span>
            <div className="text-2xl font-extrabold font-serif text-textDark mb-1">{profile.level || 'Pro Activist'}</div>
            <div className="h-1.5 w-full bg-borderLight rounded-full overflow-hidden">
              <div className="h-full bg-brand" style={{ width: '68%' }}></div>
            </div>
            <span className="text-[10px] text-textMuted mt-1 block">68% of level target met</span>
          </div>

          <div className="bg-white border border-borderLight p-5 rounded-xl shadow-xs">
            <span className="text-textMuted text-xs font-semibold uppercase tracking-wider block mb-1">Logged Workouts</span>
            <div className="text-2xl font-extrabold font-serif text-brand mb-1">{profile.stats?.totalWorkouts || 0} sessions</div>
            <span className="text-xs text-textMuted font-medium">Keep maintaining momentum</span>
          </div>

          <div className="bg-white border border-borderLight p-5 rounded-xl shadow-xs">
            <span className="text-textMuted text-xs font-semibold uppercase tracking-wider block mb-1">Total Minutes Spent</span>
            <div className="text-2xl font-extrabold font-serif text-textDark mb-1">{profile.stats?.totalDuration || 0} mins</div>
            <span className="text-xs text-textMuted font-medium">Equal to {((profile.stats?.totalDuration || 0) / 60).toFixed(1)} active hours</span>
          </div>

        </div>

        {/* Joined/Active Challenges */}
        <div>
          <h3 className="text-xl font-bold font-serif text-textDark mb-4 flex items-center gap-2">
            <i data-lucide="sparkles" className="w-5 h-5 text-brand"></i> My Active Commitments ({activeChallenges.length})
          </h3>
          
          {activeChallenges.length === 0 ? (
            <div className="bg-white border border-dashed border-borderLight p-8 rounded-xl text-center">
              <i data-lucide="award" className="w-10 h-10 text-textMuted mx-auto mb-3"></i>
              <h4 className="font-semibold text-textDark mb-1">No active challenges yet</h4>
              <p className="text-sm text-textMuted mb-4">Start your wellness commitments today to build deep focus.</p>
              <button 
                onClick={() => setCurrentTab('challenges')}
                className="bg-brand text-white text-xs font-bold px-4 py-2.5 rounded-lg"
              >
                Explore Challenges
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenges.map(c => (
                <div key={c.id} className="bg-white border border-borderLight p-5 rounded-xl hover:shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-brand-light text-brand text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        {c.category}
                      </span>
                      <span className="text-xs text-textMuted font-semibold">{c.participantsCount} competitors</span>
                    </div>
                    <h4 className="font-bold text-lg text-textDark mb-1.5 font-serif">{c.title}</h4>
                    <p className="text-xs text-textMuted line-clamp-2 mb-4 leading-relaxed">{c.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-borderLight mt-2">
                    <button 
                      onClick={() => { setSelectedChallengeId(c.id); setCurrentTab('challenges'); }}
                      className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
                    >
                      Leaderboard & Details <i data-lucide="chevron-right" className="w-3.5 h-3.5"></i>
                    </button>
                    <span className="text-[10px] text-textMuted font-medium">{c.durationDays} Days Duration</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Personal Logs */}
        <div className="bg-white border border-borderLight p-6 rounded-xl shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold font-serif text-textDark">Recent Personal Logs</h3>
            <button onClick={() => setCurrentTab('workout')} className="text-xs font-bold text-brand hover:underline">
              Log a new one
            </button>
          </div>
          
          {workoutLogs.length === 0 ? (
            <p className="text-xs text-textMuted italic">No sessions logged yet.</p>
          ) : (
            <div className="space-y-3.5">
              {workoutLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="flex justify-between items-start p-3 bg-bgSoft rounded-lg border border-borderLight/60">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 bg-brand/10 text-brand rounded-full flex items-center justify-center mt-0.5">
                      <i data-lucide="activity" className="w-4 h-4"></i>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-textDark">{log.type} Activity</div>
                      <div className="text-xs text-textMuted">{log.date} &bull; {log.duration} mins</div>
                      <p className="text-xs text-textDark mt-1 font-medium">&ldquo;{log.notes}&rdquo;</p>
                      {log.proof && (
                        <div className="mt-2 text-[10px] text-brand font-semibold flex items-center gap-1">
                          <i data-lucide="image" className="w-3 h-3"></i> Upload Proof Linked
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Mini Community Feed Overview */}
      <div className="space-y-6">
        <div className="bg-white border border-borderLight p-6 rounded-xl shadow-xs">
          <h3 className="text-lg font-bold font-serif text-textDark mb-4 flex items-center gap-2">
            <i data-lucide="message-square" className="w-5 h-5 text-brand"></i> Accountability Hub
          </h3>
          
          <div className="space-y-4">
            {recentFeed.slice(0, 3).map(item => (
              <div key={item.id} className="border-b border-borderLight pb-4 last:border-b-0 last:pb-0">
                <div className="flex gap-3 items-start mb-1.5">
                  <img src={item.userAvatar} alt={item.userName} className="w-8 h-8 rounded-full object-cover mt-0.5 border border-borderLight" />
                  <div>
                    <span className="text-xs font-bold text-textDark">{item.userName}</span>
                    <span className="text-xs text-textMuted ml-1">{item.action}</span>
                    <span className="text-[10px] text-textMuted block">{item.time}</span>
                  </div>
                </div>
                <p className="text-xs text-textDark font-medium pl-11 mb-2 leading-relaxed">
                  {item.detail}
                </p>
                <div className="pl-11 flex justify-between items-center">
                  <button 
                    onClick={() => onToggleCheer(item.id)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      item.cheered ? 'bg-brand/10 text-brand' : 'text-textMuted hover:text-textDark'
                    }`}
                  >
                    <i data-lucide="heart" className="w-3 h-3"></i> {item.cheers} Cheers
                  </button>
                  <span className="text-[10px] bg-bgSoft px-2 py-0.5 rounded text-textMuted font-medium">{item.challenge}</span>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setCurrentTab('feed')}
            className="w-full text-center mt-4 pt-3 border-t border-borderLight text-xs font-bold text-brand hover:underline block"
          >
            Open Community Feed
          </button>
        </div>
      </div>

    </div>
  );
}
