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
    dataService.getChallenge(id).then(setChallenge).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (!challenge) return <div className="text-center py-20 text-text-muted">Challenge not found</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <button onClick={() => router.push("/challenges")} className="text-xs font-bold text-brand hover:underline flex items-center gap-1.5 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Challenges
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white border border-border-light rounded-2xl p-6 shadow-sm">
            <span className="bg-brand-light text-brand text-xs font-extrabold px-3 py-1 rounded-md uppercase tracking-wider inline-block mb-3">
              {challenge.category}
            </span>
            <h1 className="text-2xl font-bold font-serif text-text-dark mb-3">{challenge.title}</h1>
            <p className="text-sm text-text-muted leading-relaxed">{challenge.description}</p>
          </div>
          <div className="bg-gradient-to-br from-brand/5 to-brand/10 border border-brand/20 rounded-2xl p-5">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-brand mb-2 flex items-center gap-1.5">
              <Bot className="w-4 h-4" /> AI Coach Guidance
            </h4>
            <p className="text-xs italic text-text-dark leading-relaxed">&ldquo;{challenge.aiCoachTip}&rdquo;</p>
          </div>
          <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Difficulty</span>
              <span className="font-bold">{challenge.difficulty}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted flex items-center gap-1"><Users className="w-4 h-4" /> Participants</span>
              <span className="font-bold">{challenge.participantsCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted flex items-center gap-1"><Clock className="w-4 h-4" /> Duration</span>
              <span className="font-bold">{challenge.durationDays} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted flex items-center gap-1"><Sparkles className="w-4 h-4" /> XP Reward</span>
              <span className="font-bold text-brand">{challenge.xpReward} XP</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-border-light rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold font-serif flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Leaderboard</h2>
              <span className="text-xs text-text-muted font-semibold">Top performers</span>
            </div>
            <div className="space-y-2">
              {(challenge.leaderboard || []).map((entry: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors ${entry.name.includes("You") ? "bg-brand-light border border-brand/20" : "hover:bg-bg-soft"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 text-center text-sm font-extrabold ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-text-muted"}`}>
                      {i + 1}
                    </span>
                    <img src={entry.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-border-light" />
                    <div>
                      <span className="text-sm font-bold text-text-dark">{entry.name}</span>
                      {entry.name.includes("You") && <span className="text-[10px] text-brand font-bold ml-1">(you)</span>}
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-brand">{entry.score} <span className="text-[10px] text-text-muted font-semibold">pts</span></span>
                </motion.div>
              ))}
              {(!challenge.leaderboard || challenge.leaderboard.length === 0) && (
                <div className="text-center py-10 text-text-muted text-sm">No entries yet. Be the first!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-shimmer">
      <div className="h-4 w-32 bg-gray-200 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white border border-border-light rounded-2xl p-6 h-48" />
          <div className="bg-white border border-border-light rounded-2xl p-6 h-24" />
        </div>
        <div className="lg:col-span-2 bg-white border border-border-light rounded-2xl p-6 h-96" />
      </div>
    </div>
  );
}
