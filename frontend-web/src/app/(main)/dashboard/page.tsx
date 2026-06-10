"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Activity, Heart, TrendingUp, ChevronRight } from "lucide-react";
import { dataService } from "@/lib/data-service";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dataService.getProfile(),
      dataService.getChallenges(),
      dataService.getFeed(),
    ]).then(([p, c, f]) => {
      setProfile(p);
      setChallenges(c.filter((ch: any) => ch.joined));
      setLogs(p.logs || []);
      setFeed(f.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: Trophy, label: "XP Level", value: profile?.level || "Pro Activist", sub: "68% to next level", color: "text-brand", bg: "bg-brand-light" },
            { icon: Activity, label: "Workouts Logged", value: `${profile?.stats?.totalWorkouts || 0} sessions`, sub: "Keep momentum", color: "text-blue-600", bg: "bg-blue-50" },
            { icon: TrendingUp, label: "Total Minutes", value: `${profile?.stats?.totalDuration || 0} mins`, sub: `${((profile?.stats?.totalDuration || 0) / 60).toFixed(1)} active hours`, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
              className="bg-white border border-border-light rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">{stat.label}</div>
              <div className={`text-xl font-extrabold font-serif ${stat.color} mb-0.5`}>{stat.value}</div>
              <div className="text-[10px] text-text-muted">{stat.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Active Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-border-light rounded-2xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold font-serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand" /> Active Challenges
            </h2>
            <button onClick={() => router.push("/challenges")} className="text-xs font-bold text-brand hover:underline">View all</button>
          </div>
          {challenges.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-sm text-text-muted mb-3">No active challenges</p>
              <button onClick={() => router.push("/challenges")} className="bg-brand text-white text-xs font-bold px-5 py-2.5 rounded-xl">Explore Challenges</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="border border-border-light rounded-xl p-5 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => router.push(`/challenges/${c.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-brand-light text-brand text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">{c.category}</span>
                    <span className="text-xs text-text-muted font-semibold">{c.participantsCount} participants</span>
                  </div>
                  <h3 className="font-bold text-text-dark mb-1.5">{c.title}</h3>
                  <p className="text-xs text-text-muted line-clamp-2 mb-4">{c.description}</p>
                  <div className="flex justify-between items-center pt-3 border-t border-border-light">
                    <span className="text-xs font-semibold text-brand flex items-center gap-1">
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                    <span className="text-[10px] text-text-muted">{c.durationDays} days</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-border-light rounded-2xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold font-serif">Recent Workouts</h2>
            <button onClick={() => router.push("/workout")} className="text-xs font-bold text-brand hover:underline">Log new</button>
          </div>
          {logs.length === 0 ? (
            <p className="text-xs text-text-muted italic">No sessions logged yet.</p>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 3).map((log: any) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-3 bg-bg-soft rounded-xl border border-border-light/60"
                >
                  <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-text-dark">{log.type}</div>
                    <div className="text-xs text-text-muted">{log.date} &middot; {log.duration} mins</div>
                    {log.notes && <p className="text-xs text-text-dark mt-1 font-medium truncate">&ldquo;{log.notes}&rdquo;</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Accountability Hub */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-border-light rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-bold font-serif flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-brand" /> Accountability Hub
          </h3>
          <div className="space-y-4">
            {feed.map((item: any) => (
              <div key={item.id} className="border-b border-border-light pb-4 last:border-b-0 last:pb-0">
                <div className="flex gap-3 items-start mb-1.5">
                  <img src={item.userAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-border-light" />
                  <div>
                    <span className="text-xs font-bold text-text-dark">{item.userName}</span>
                    <span className="text-xs text-text-muted ml-1">{item.action}</span>
                    <span className="text-[10px] text-text-muted block">{item.time}</span>
                  </div>
                </div>
                <p className="text-xs text-text-dark font-medium pl-11 mb-2">{item.detail}</p>
                <div className="pl-11 flex items-center gap-2">
                  <span className={`text-[10px] font-bold flex items-center gap-1 ${item.cheered ? "text-red-500" : "text-text-muted"}`}>
                    <Heart className={`w-3 h-3 ${item.cheered ? "fill-red-500" : ""}`} /> {item.cheers}
                  </span>
                  <span className="text-[10px] bg-bg-soft px-2 py-0.5 rounded text-text-muted">{item.challenge}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => router.push("/feed")} className="w-full text-center mt-4 pt-3 border-t border-border-light text-xs font-bold text-brand hover:underline block">
            Open Community Feed
          </button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-brand to-emerald-700 rounded-2xl p-6 text-white shadow-lg"
        >
          <h3 className="font-bold text-lg mb-1">Welcome back!</h3>
          <p className="text-white/80 text-sm mb-4">Keep your fitness streak alive in Abuja.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
              <div className="text-2xl font-extrabold">{profile?.stats?.totalWorkouts || 0}</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider">Workouts</div>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
              <div className="text-2xl font-extrabold">{profile?.completedCount || 0}</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider">Milestones</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="bg-white border border-border-light rounded-2xl p-5 animate-shimmer h-28" />)}
        </div>
        <div className="bg-white border border-border-light rounded-2xl p-6 animate-shimmer h-64" />
      </div>
      <div className="bg-white border border-border-light rounded-2xl p-6 animate-shimmer h-80" />
    </div>
  );
}
