"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageSquare, Send, TrendingUp, Users, Sparkles } from "lucide-react";
import { dataService } from "@/lib/data-service";

export default function FeedPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [filter, setFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { dataService.getFeed().then(setFeed).finally(() => setLoading(false)); }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() || submitting) return;
    setSubmitting(true);
    await dataService.createPost(newPostText);
    setNewPostText("");
    setFeed(await dataService.getFeed());
    setSubmitting(false);
  };

  const handleCheer = async (id: string) => {
    await dataService.toggleCheer(id);
    setFeed(await dataService.getFeed());
  };

  const filtered = filter === "all" ? feed : feed.filter((item: any) => item.type === filter);

  if (loading) return <FeedSkeleton />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Community Feed</h1>
          <p className="text-sm text-slate-500 mt-1">Stay connected with Abuja&apos;s fitness community</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All" },
            { id: "workout", label: "🏃 Workouts" },
            { id: "post", label: "💬 Posts" },
            { id: "milestone", label: "🏆 Milestones" },
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id ? "gradient-brand text-white shadow-md" : "card text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* New Post */}
        <div className="card p-5">
          <form onSubmit={handlePost}>
            <label className="text-xs uppercase font-bold tracking-wider text-slate-500 block mb-2">
              Share with the community
            </label>
            <textarea
              rows={2} value={newPostText} onChange={e => setNewPostText(e.target.value)}
              placeholder="Share motivation, tips, or your latest achievement..."
              className="input-field resize-none mb-3"
            />
            <div className="flex justify-end">
              <button type="submit" disabled={submitting || !newPostText.trim()}
                className="btn-primary text-xs px-5 py-2.5 disabled:opacity-50">
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
              className="card p-5"
            >
              <div className="flex gap-4 items-start mb-3">
                <img src={item.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-slate-100" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-800">{item.userName}</span>
                    <span className="text-xs text-slate-400">{item.action}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{item.time}</span>
                </div>
              </div>
              <p className="text-sm text-slate-700 font-medium leading-relaxed mb-4 pl-14">{item.detail}</p>
              <div className="pl-14 pt-3 border-t border-slate-100 flex items-center justify-between">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCheer(item.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    item.cheered ? "bg-rose-50 text-rose-500" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${item.cheered ? "fill-rose-500" : ""}`} />
                  {item.cheers} Cheers
                </motion.button>
                <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-full text-slate-500 font-medium">{item.challenge}</span>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No posts yet. Be the first to share!</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <div className="card p-5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-emerald-500" /> Guidelines
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            FitNaija builds fitness consistency with AI Coach tracking logs. Maintain integrity in timing and speed logs. Peer review operates at 100% capacity!
          </p>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Trending Challenges
          </h3>
          <div className="space-y-3">
            {["Maitama Morning Run", "Wuse II Strength", "Garki HIIT"].map(name => (
              <div key={name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold text-slate-700">{name}</span>
                <span className="badge bg-emerald-100 text-emerald-700">Active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gradient-brand rounded-2xl p-5 text-white shadow-lg shadow-emerald-200/50">
          <Users className="w-8 h-8 mb-2 opacity-80" />
          <h3 className="font-bold text-lg mb-1">Join the movement</h3>
          <p className="text-emerald-100 text-xs">Abuja&apos;s fastest growing fitness community</p>
        </div>
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-8 w-40 skeleton" />
        <div className="card p-5 skeleton h-24" />
        {[1,2,3].map(i => <div key={i} className="card p-5 skeleton h-32" />)}
      </div>
      <div className="card p-5 skeleton h-48" />
    </div>
  );
}
