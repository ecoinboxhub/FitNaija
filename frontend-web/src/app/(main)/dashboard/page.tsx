"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Activity, ChevronRight, Zap, Flame } from "lucide-react";
import { dataService } from "@/lib/data-service";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dataService.getProfile(), dataService.getChallenges(), dataService.getFeed()])
      .then(([p, c, f]) => {
        setProfile(p);
        setChallenges(c.filter((ch: any) => ch.joined));
        setLogs(p.logs || []);
        setFeed(f.slice(0, 3));
      }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  const stats = [
    { icon: Trophy, label: "Rank", value: profile?.level || "Pro Activist", sub: "Elite tier", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Activity, label: "Workouts", value: `${profile?.stats?.totalWorkouts || 0}`, sub: "Total sessions", color: "text-violet-600", bg: "bg-violet-50" },
    { icon: Flame, label: "Minutes", value: `${profile?.stats?.totalDuration || 0}`, sub: "Active time", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Welcome */}
        <motion.div variants={item} className="gradient-brand rounded-2xl p-6 text-white shadow-lg shadow-emerald-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Welcome back,</p>
              <h1 className="text-2xl font-bold mt-0.5">{profile?.name || "Champion"}</h1>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Zap className="w-6 h-6 text-yellow-300" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="bg-white/15 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">{profile?.xp || 0} XP</span>
            <span className="bg-white/15 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">{challenges.length} Active</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={item}
              whileHover={{ y: -2 }}
              className={`card p-5 ${i === 0 ? 'card-highlight' : ''}`}
            >
              <div className={`${s.bg} ${s.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{s.label}</div>
              <div className={`text-xl font-extrabold ${s.color} mb-0.5`}>{s.value}</div>
              <div className="text-[11px] text-slate-400">{s.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Active Challenges */}
        <motion.div variants={item} className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" /> Active Challenges
            </h2>
            <button onClick={() => router.push("/challenges")} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">View all</button>
          </div>
          {challenges.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-3">No active challenges yet</p>
              <button onClick={() => router.push("/challenges")} className="btn-primary text-xs px-5 py-2.5">Explore Challenges</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -2 }}
                  className="border border-slate-100 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => router.push(`/challenges/${c.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge bg-emerald-50 text-emerald-700">{c.category}</span>
                    <span className="text-xs text-slate-400 font-medium">{c.participantsCount} joined</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1.5 group-hover:text-emerald-600 transition-colors">{c.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{c.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{c.durationDays} days</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Logs */}
        <motion.div variants={item} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Recent Workouts</h2>
            <button onClick={() => router.push("/workout")} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Log new</button>
          </div>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center py-6">No sessions logged yet. Start your journey!</p>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 3).map((log: any, i: number) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100/60"
                >
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shrink-0 shadow-sm">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-slate-800">{log.type}</span>
                      <span className="text-xs text-slate-400">&middot; {log.duration} mins</span>
                    </div>
                    {log.notes && <p className="text-xs text-slate-500 truncate">&ldquo;{log.notes}&rdquo;</p>}
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{log.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Accountability Hub */}
        <motion.div variants={item} className="card p-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Community Pulse
          </h3>
          <div className="space-y-4">
            {feed.map((item: any) => (
              <div key={item.id} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex gap-3 items-start mb-1.5">
                  <img src={item.userAvatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-slate-100" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-800">{item.userName}</span>
                    <span className="text-xs text-slate-400 ml-1">{item.action}</span>
                    <span className="text-[10px] text-slate-400 block">{item.time}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-medium pl-11">{item.detail}</p>
                <div className="pl-11 mt-2 flex items-center gap-2">
                  <span className={`text-[10px] font-bold flex items-center gap-1 ${item.cheered ? "text-rose-500" : "text-slate-400"}`}>
                    <Flame className={`w-3 h-3 ${item.cheered ? "fill-rose-500" : ""}`} /> {item.cheers}
                  </span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-medium">{item.challenge}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => router.push("/feed")} className="w-full text-center mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors block">
            View full feed
          </button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={item} className="gradient-brand rounded-2xl p-6 text-white shadow-lg shadow-emerald-200/50">
          <h3 className="font-bold text-lg mb-1">Keep pushing!</h3>
          <p className="text-emerald-100 text-sm mb-5">Your fitness journey in Abuja</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/15 rounded-xl p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-extrabold">{profile?.stats?.totalWorkouts || 0}</div>
              <div className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">Workouts</div>
            </div>
            <div className="bg-white/15 rounded-xl p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-extrabold">{profile?.completedCount || 0}</div>
              <div className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">Milestones</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl p-6 skeleton h-32" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card p-5 skeleton h-28" />)}
        </div>
        <div className="card p-6 skeleton h-64" />
      </div>
      <div className="card p-6 skeleton h-80" />
    </div>
  );
}
