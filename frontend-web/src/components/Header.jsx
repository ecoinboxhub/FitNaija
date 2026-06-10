import React from 'react';

export default function Header({ currentTab, setCurrentTab, selectedChallengeId, setSelectedChallengeId, xpPoints, onOpenLogin, user }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'challenges', label: 'Challenges', icon: 'trophy' },
    { id: 'workout', label: 'Log Workout', icon: 'plus-circle' },
    { id: 'feed', label: 'Community', icon: 'users' },
    { id: 'profile', label: 'Profile', icon: 'user' }
  ];

  return (
    <header className="sticky top-0 bg-bgSoft/90 backdrop-blur-md border-b border-borderLight z-40 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* App Identity */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => { setCurrentTab('dashboard'); setSelectedChallengeId(null); }}
        >
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand/20">
            FN
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand flex items-center gap-1 leading-none">
              FitNaija
            </h1>
            <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Abuja Elite</span>
          </div>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setCurrentTab(tab.id); setSelectedChallengeId(null); }}
              className={`text-sm font-semibold transition-colors py-2 flex items-center gap-2 ${
                currentTab === tab.id && !selectedChallengeId
                  ? 'text-brand border-b-2 border-brand' 
                  : 'text-textMuted hover:text-textDark'
              }`}
            >
              <i data-lucide={tab.icon} className="w-4 h-4"></i> {tab.label}
            </button>
          ))}
        </nav>

        {/* Status Bar */}
        <div className="flex items-center gap-3">
          <div className="bg-brand-light text-brand px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm border border-brand/10">
            <i data-lucide="sparkles" className="w-3.5 h-3.5"></i>
            <span>{xpPoints} XP</span>
          </div>
          
          <button 
            onClick={onOpenLogin}
            className="text-xs font-bold text-textDark border border-borderLight bg-white px-3.5 py-1.5 rounded-full hover:bg-bgSoft flex items-center gap-1.5"
          >
            <i data-lucide="key" className="w-3.5 h-3.5 text-brand"></i>
            {user ? 'Linked' : 'Link Profile'}
          </button>
        </div>

      </div>
    </header>
  );
}
