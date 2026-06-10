"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Users, Clock, Sparkles, Bot } from "lucide-react";
import { dataService } from "@/lib/data-service";

export default function ChallengeDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) dataService.getChallenge(id as string).then(setChallenge).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (!challenge) return (
    <div className="text-center py-20">
      <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
      <p className="text-slate-500">Challenge not found</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <button onClick={() => router.push("/challenges")} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Challenges
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Column */}
        <div className="lg:col-span-1 space-y-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <span className="badge bg-emerald-50 text-emerald-700 mb-3 inline-block">{challenge.category}</span>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">{challenge.title}</h1>
            <p className="text-sm text-slate-500 leading-relaxed">{challenge.description}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
              <Bot className="w-4 h-4" /> AI Coach Guidance
            </h4>
            <p className="text-sm italic text-slate-700 leading-relaxed">&ldquo;{challenge.aiCoachTip}&rdquo;</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5 space-y-3">
            {[
              { label: "Difficulty", value: challenge.difficulty, color: "text-amber-600" },
              { label: "Participants", value: `${challenge.participantsCount}`, icon: Users },
              { label: "Duration", value: `${challenge.durationDays} days`, icon: Clock },
              { label: "XP Reward", value: `${challenge.xpReward} XP`, icon: Sparkles, color: "text-emerald-600" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-1.5">
                  {row.icon && <row.icon className="w-4 h-4" />} {row.label}
                </span>
                <span className={`font-bold ${row.color || "text-slate-700"}`}>{row.value}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Leaderboard
              </h2>
              <span className="text-xs text-slate-400 font-medium">{challenge.leaderboard?.length || 0} participants</span>
            </div>
            <div className="space-y-2">
              {(challenge.leaderboard || []).map((entry: any, i: number) => {
                const isYou = entry.name.includes("You");
                return (
              <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${
                    isYou ? "bg-emerald-50 border border-emerald-200" : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold ${
                      i === 0 ? "bg-amber-100 text-amber-600" :
                      i === 1 ? "bg-slate-100 text-slate-500" :
                      i === 2 ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-400"
                    }`}>
                      {i + 1}
                    </div>
                      <img src={entry.avatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-slate-100" />
                      <div>
                        <span className="text-sm font-bold text-slate-800">{entry.name}</span>
                        {isYou && <span className="badge bg-emerald-100 text-emerald-700 ml-2 text-[10px]">You</span>}
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-600">
                      {entry.score} <span className="text-[10px] text-slate-400 font-medium">pts</span>
                    </span>
                  </motion.div>
                );
              })}
              {(!challenge.leaderboard || challenge.leaderboard.length === 0) && (
                <div className="text-center py-12 text-slate-400 text-sm">No entries yet. Be the first competitor!</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="h-4 w-32 skeleton rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5">
          <div className="card p-6 skeleton h-48" />
          <div className="card p-6 skeleton h-24" />
        </div>
        <div className="lg:col-span-2 card p-6 skeleton h-96" />
      </div>
    </div>
  );
}
