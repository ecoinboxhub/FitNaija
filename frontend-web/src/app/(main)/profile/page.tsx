"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Activity, Calendar, MapPin, Sparkles, Dumbbell } from "lucide-react";
import { dataService } from "@/lib/data-service";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    dataService.getProfile().then(setProfile);
  }, []);

  if (!profile) return <ProfileSkeleton />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-border-light rounded-2xl p-6 text-center shadow-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="relative inline-block"
            >
              <img src={profile.avatar} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-brand-light shadow-lg mx-auto" />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-brand rounded-full flex items-center justify-center border-2 border-white">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </motion.div>
            <h2 className="text-xl font-bold font-serif mt-4 mb-1">{profile.name}</h2>
            <p className="text-xs text-text-muted flex items-center justify-center gap-1 mb-4">
              <MapPin className="w-3 h-3" /> {profile.role}
            </p>
            <div className="bg-bg-soft rounded-xl p-3 border border-border-light inline-block">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-text-muted block">Rank</span>
              <span className="text-brand font-bold text-sm">{profile.level}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-border-light rounded-2xl p-5 shadow-sm"
          >
            <h3 className="font-bold text-sm font-serif mb-3">Stats</h3>
            <div className="space-y-3">
              {[
                { icon: Trophy, label: "XP Points", value: `${profile.xp} XP` },
                { icon: Activity, label: "Workouts Logged", value: `${profile.stats?.totalWorkouts || 0}` },
                { icon: Calendar, label: "Challenges Completed", value: `${profile.completedCount}` },
                { icon: Dumbbell, label: "Active Minutes", value: `${profile.stats?.totalDuration || 0}` },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between p-2.5 bg-bg-soft rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-4 h-4 text-brand" />
                    </div>
                    <span className="text-xs font-semibold text-text-muted">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-text-dark">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-5">
          {/* Workout History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-border-light rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold font-serif mb-4">Workout History</h2>
            {(!profile.logs || profile.logs.length === 0) ? (
              <div className="text-center py-10">
                <Activity className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
                <p className="text-sm text-text-muted">No workouts logged yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.logs.map((log: any, i: number) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-4 bg-bg-soft rounded-xl border border-border-light/60 flex items-start justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-brand" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-brand-light text-brand text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                            {log.type}
                          </span>
                          <span className="text-xs font-bold text-text-dark">{log.duration} mins</span>
                        </div>
                        {log.notes && <p className="text-xs text-text-dark font-medium">&ldquo;{log.notes}&rdquo;</p>}
                        <span className="text-[10px] text-text-muted block mt-1">{log.date}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Completed Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-border-light rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold font-serif mb-4">Completed Milestones ({profile.completedCount})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { month: "May 2026", title: "Central Area Fast Walk 10K", xp: "400 XP" },
                { month: "April 2026", title: "Jabi Lake Sprint Marathon", xp: "500 XP" },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="p-4 bg-bg-soft border border-border-light rounded-xl"
                >
                  <span className="text-brand text-xs font-bold block mb-1">{m.month}</span>
                  <h4 className="font-bold text-sm text-text-dark">{m.title}</h4>
                  <span className="text-[10px] text-text-muted font-medium">{m.xp}</span>
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
      <div className="md:col-span-1 bg-white border border-border-light rounded-2xl p-6 animate-shimmer h-64" />
      <div className="md:col-span-2 space-y-5">
        <div className="bg-white border border-border-light rounded-2xl p-6 animate-shimmer h-48" />
        <div className="bg-white border border-border-light rounded-2xl p-6 animate-shimmer h-32" />
      </div>
    </div>
  );
}
