import React, { useState } from 'react';

export default function CommunityFeed({ feed, onAddPost, onToggleCheer }) {
  const [newPostText, setNewPostText] = useState('');
  const [feedFilter, setFeedFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddPost(newPostText);
      setNewPostText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFeed = feed.filter(item => feedFilter === 'all' || item.type === feedFilter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left columns: feed item creator & posts list */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Feed filter selector */}
        <div className="flex gap-2 border-b border-borderLight pb-4">
          <button 
            onClick={() => setFeedFilter('all')} 
            className={`text-xs font-bold px-4 py-2 rounded-lg ${feedFilter === 'all' ? 'bg-textDark text-white' : 'bg-white border border-borderLight text-textMuted'}`}
          >
            All Activities
          </button>
          <button 
            onClick={() => setFeedFilter('workout')} 
            className={`text-xs font-bold px-4 py-2 rounded-lg ${feedFilter === 'workout' ? 'bg-textDark text-white' : 'bg-white border border-borderLight text-textMuted'}`}
          >
            Workout Logs
          </button>
          <button 
            onClick={() => setFeedFilter('post')} 
            className={`text-xs font-bold px-4 py-2 rounded-lg ${feedFilter === 'post' ? 'bg-textDark text-white' : 'bg-white border border-borderLight text-textMuted'}`}
          >
            Encouragement Posts
          </button>
        </div>

        {/* Post creation form */}
        <div className="bg-white border border-borderLight p-4 rounded-xl shadow-xs">
          <form onSubmit={handleSubmitPost}>
            <label className="text-xs uppercase font-extrabold tracking-wider text-textDark block mb-2">Encourage your colleagues</label>
            <textarea 
              rows="2"
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="Share fitness inspiration or tips for running in the early morning..."
              className="w-full bg-bgSoft border border-borderLight rounded-lg p-3 text-sm text-textDark outline-none focus:border-brand resize-none mb-3"
            ></textarea>
            
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-brand hover:bg-brand-hover text-white text-xs font-bold px-4 py-2.5 rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sharing...' : 'Share Accountability Post'}
              </button>
            </div>
          </form>
        </div>

        {/* Feed Posts */}
        <div className="space-y-4">
          {filteredFeed.map(item => (
            <div key={item.id} className="bg-white border border-borderLight p-6 rounded-xl shadow-xs">
              <div className="flex gap-4 items-start mb-4">
                <img src={item.userAvatar} alt={item.userName} className="w-10 h-10 rounded-full object-cover border border-borderLight" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-textDark">{item.userName}</span>
                    <span className="text-xs text-textMuted">{item.action}</span>
                  </div>
                  <span className="text-[10px] text-textMuted font-medium block">{item.time}</span>
                </div>
              </div>

              <p className="text-sm text-textDark font-medium leading-relaxed mb-4 pl-14">
                {item.detail}
              </p>

              <div className="pl-14 pt-4 border-t border-borderLight flex justify-between items-center">
                <button 
                  onClick={() => onToggleCheer(item.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    item.cheered ? 'bg-brand-light text-brand' : 'text-textMuted hover:text-textDark hover:bg-bgSoft'
                  }`}
                >
                  <i data-lucide="heart" className="w-4 h-4"></i> {item.cheers} Cheers
                </button>
                <span className="text-xs bg-bgSoft px-3 py-1 rounded-md text-textMuted font-semibold">
                  {item.challenge}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Right Column: Community Guidelines & Highlights */}
      <div className="space-y-6">
        
        <div className="bg-white border border-borderLight p-5 rounded-xl shadow-xs">
          <h4 className="font-bold text-textDark font-serif text-lg mb-3">Abuja Fitness Accountability guidelines</h4>
          <p className="text-xs text-textMuted leading-relaxed">
            FitNaija builds fitness consistency with AI Coach tracking logs. Always maintain integrity in timing and speed logs. Peer review operates at 100% capacity!
          </p>
        </div>

        <div className="bg-white border border-borderLight p-5 rounded-xl shadow-xs">
          <h4 className="font-bold text-textDark font-serif text-lg mb-3">Trending Challenge Group</h4>
          <div className="flex justify-between items-center p-3 bg-bgSoft rounded-lg border border-borderLight/60">
            <div>
              <span className="text-xs font-bold text-textDark block">Wuse II Strength & Tone</span>
              <span className="text-[10px] text-textMuted font-medium">128 active competitors</span>
            </div>
            <button className="bg-brand text-white text-[10px] font-bold px-3 py-1.5 rounded-md cursor-pointer">
              Active
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
