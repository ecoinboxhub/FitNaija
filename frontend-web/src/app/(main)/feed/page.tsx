"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageSquare, Send, TrendingUp, Users } from "lucide-react";
import { dataService } from "@/lib/data-service";

export default function FeedPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [filter, setFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dataService.getFeed().then(setFeed).finally(() => setLoading(false));
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() || submitting) return;
    setSubmitting(true);
    await dataService.createPost(newPostText);
    setNewPostText("");
    const updated = await dataService.getFeed();
    setFeed(updated);
    setSubmitting(false);
  };

  const handleCheer = async (id: string) => {
    await dataService.toggleCheer(id);
    const updated = await dataService.getFeed();
    setFeed(updated);
  };

  const filtered = filter === "all" ? feed : feed.filter((item: any) => item.type === filter);

  if (loading) return <FeedSkeleton />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif">Community Feed</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Activity" },
            { id: "workout", label: "Workouts" },
            { id: "post", label: "Posts" },
            { id: "milestone", label: "Milestones" },
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id ? "bg-brand text-white shadow-lg shadow-brand/20" : "bg-white border border-border-light text-text-muted hover:text-text-dark"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* New Post */}
        <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm">
          <form onSubmit={handlePost}>
            <label className="text-xs uppercase font-extrabold tracking-wider text-text-dark block mb-2">
              Share with the community
            </label>
            <textarea
              rows={2}
              value={newPostText}
              onChange={e => setNewPostText(e.target.value)}
              placeholder="Share motivation, tips, or your latest workout achievement..."
              className="w-full bg-bg-soft border border-border-light rounded-xl p-4 text-sm text-text-dark outline-none focus:border-brand transition-all resize-none mb-3"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newPostText.trim()}
                className="bg-brand hover:bg-brand-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> {submitting ? "Posting..." : "Share Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Feed Items */}
        <div className="space-y-4">
          {filtered.map((item: any, i: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white border border-border-light rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex gap-4 items-start mb-3">
                <img src={item.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover border border-border-light" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-text-dark">{item.userName}</span>
                    <span className="text-xs text-text-muted">{item.action}</span>
                  </div>
                  <span className="text-[10px] text-text-muted">{item.time}</span>
                </div>
              </div>
              <p className="text-sm text-text-dark font-medium leading-relaxed mb-4 pl-14">{item.detail}</p>
              <div className="pl-14 pt-3 border-t border-border-light flex items-center justify-between">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCheer(item.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    item.cheered ? "bg-red-50 text-red-500" : "text-text-muted hover:text-text-dark hover:bg-bg-soft"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${item.cheered ? "fill-red-500" : ""}`} />
                  {item.cheers} Cheers
                </motion.button>
                <span className="text-xs bg-bg-soft px-3 py-1 rounded-md text-text-muted font-semibold">{item.challenge}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-serif flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-brand" /> Community Guidelines
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            FitNaija builds fitness consistency with AI Coach tracking logs. Always maintain integrity in timing and speed logs. Peer review operates at 100% capacity!
          </p>
        </div>

        <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-serif flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-brand" /> Trending
          </h3>
          <div className="space-y-3">
            {["Maitama Morning Run Club", "Wuse II Strength & Tone", "Garki Corporate Calorie Burn"].map(name => (
              <div key={name} className="flex items-center justify-between p-3 bg-bg-soft rounded-xl">
                <span className="text-xs font-bold text-text-dark">{name}</span>
                <span className="bg-brand text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">Active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-brand to-emerald-700 rounded-2xl p-5 text-white shadow-lg">
          <Users className="w-8 h-8 mb-2 opacity-80" />
          <h3 className="font-bold text-lg mb-1">Join the movement</h3>
          <p className="text-white/80 text-xs">Abuja&apos;s fastest growing fitness community</p>
        </div>
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-8 w-40 bg-gray-200 rounded-lg animate-shimmer" />
        <div className="bg-white border border-border-light rounded-2xl p-5 animate-shimmer h-24" />
        {[1,2,3].map(i => <div key={i} className="bg-white border border-border-light rounded-2xl p-5 animate-shimmer h-32" />)}
      </div>
      <div className="bg-white border border-border-light rounded-2xl p-5 animate-shimmer h-48" />
    </div>
  );
}
