"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Activity, MapPin, Sparkles, Flame, Award } from "lucide-react";
import { dataService } from "@/lib/data-service";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => { dataService.getProfile().then(setProfile); }, []);

  if (!profile) return <ProfileSkeleton />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }} className="relative inline-block">
              <img src={profile.avatar} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 shadow-lg mx-auto" />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 gradient-brand rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </motion.div>
            <h2 className="text-xl font-bold text-slate-800 mt-4 mb-1">{profile.name}</h2>
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mb-4">
              <MapPin className="w-3 h-3" /> {profile.role}
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-50 rounded-xl px-4 py-2.5 border border-emerald-100">
              <Award className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">{profile.level}</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5">
            <h3 className="font-bold text-sm text-slate-800 mb-4">Statistics</h3>
            <div className="space-y-3">
              {[
                { icon: Trophy, label: "XP Points", value: `${profile.xp} XP`, color: "text-amber-600", bg: "bg-amber-50" },
                { icon: Activity, label: "Workouts", value: `${profile.stats?.totalWorkouts || 0}`, color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: Flame, label: "Minutes Active", value: `${profile.stats?.totalDuration || 0}`, color: "text-rose-600", bg: "bg-rose-50" },
                { icon: Award, label: "Milestones", value: `${profile.completedCount}`, color: "text-violet-600", bg: "bg-violet-50" },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className={`${stat.bg} ${stat.color} w-8 h-8 rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-5">
          {/* Workout History */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Workout History</h2>
            {(!profile.logs || profile.logs.length === 0) ? (
              <div className="text-center py-10">
                <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No workouts logged yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.logs.map((log: any, i: number) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100/60"
                  >
                    <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shrink-0 shadow-sm">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="badge bg-emerald-50 text-emerald-700">{log.type}</span>
                        <span className="text-xs font-bold text-slate-700">{log.duration} mins</span>
                      </div>
                      {log.notes && <p className="text-xs text-slate-600 font-medium truncate">&ldquo;{log.notes}&rdquo;</p>}
                      <span className="text-[11px] text-slate-400 mt-0.5 block">{log.date}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Milestones */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Completed Milestones ({profile.completedCount})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { month: "May 2026", title: "Central Area Fast Walk 10K", xp: "400 XP", color: "from-emerald-500 to-teal-600" },
                { month: "April 2026", title: "Jabi Lake Sprint Marathon", xp: "500 XP", color: "from-violet-500 to-purple-600" },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.1 }}
                  className={`bg-gradient-to-br ${m.color} rounded-xl p-4 text-white shadow-md`}
                >
                  <span className="text-xs font-bold text-white/70 block mb-1">{m.month}</span>
                  <h4 className="font-bold text-sm mb-1">{m.title}</h4>
                  <span className="text-[10px] text-white/80 font-semibold">{m.xp}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 card p-6 skeleton h-64" />
      <div className="md:col-span-2 space-y-5">
        <div className="card p-6 skeleton h-48" />
        <div className="card p-6 skeleton h-32" />
      </div>
    </div>
  );
}
