"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Clock, Sparkles, ChevronRight, Search } from "lucide-react";
import { dataService } from "@/lib/data-service";

export default function ChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    dataService.getChallenges().then(setChallenges).finally(() => setLoading(false));
  }, []);

  const handleJoin = async (id: string) => {
    setJoinLoading(id);
    await dataService.joinChallenge(id);
    const updated = await dataService.getChallenges();
    setChallenges(updated);
    setJoinLoading(null);
  };

  const categories = ["all", "Running", "Strength", "HIIT", "Yoga"];
  const filtered = filter === "all" ? challenges : challenges.filter(c => c.category === filter);

  if (loading) return <ChallengesSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif">Challenges</h1>
          <p className="text-sm text-text-muted mt-1">{challenges.length} active challenges in Abuja</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            placeholder="Search challenges..."
            className="pl-9 pr-4 py-2.5 bg-white border border-border-light rounded-xl text-sm outline-none focus:border-brand w-full sm:w-64"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === cat ? "bg-brand text-white shadow-lg shadow-brand/20" : "bg-white border border-border-light text-text-muted hover:text-text-dark"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </motion.button>
        ))}
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((challenge, i) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
          >
            {/* Card Header Accent */}
            <div className={`h-2 ${
              challenge.difficulty === "Beginner" ? "bg-green-400" :
              challenge.difficulty === "Intermediate" ? "bg-amber-400" : "bg-red-400"
            }`} />

            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-brand-light text-brand text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {challenge.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-text-muted font-semibold">
                  <Users className="w-3.5 h-3.5" /> {challenge.participantsCount}
                </span>
              </div>

              <h3 className="font-bold text-lg text-text-dark mb-2 font-serif">{challenge.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed mb-4 line-clamp-2">{challenge.description}</p>

              <div className="space-y-2 mb-4 pt-3 border-t border-border-light">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Difficulty</span>
                  <span className="font-bold">{challenge.difficulty}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Duration</span>
                  <span className="font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> {challenge.durationDays} days</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">XP Reward</span>
                  <span className="font-bold text-brand flex items-center gap-1"><Sparkles className="w-3 h-3" /> {challenge.xpReward} XP</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/challenges/${challenge.id}`)}
                  className="flex-1 text-xs font-bold text-text-dark border border-border-light px-3 py-2.5 rounded-xl hover:bg-bg-soft transition-colors flex items-center justify-center gap-1"
                >
                  Details <ChevronRight className="w-3 h-3" />
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleJoin(challenge.id)}
                  disabled={joinLoading === challenge.id}
                  className={`flex-1 text-xs font-bold px-3 py-2.5 rounded-xl transition-all disabled:opacity-50 ${
                    challenge.joined
                      ? "bg-text-dark text-white hover:bg-brand"
                      : "bg-brand text-white hover:bg-brand-hover"
                  }`}
                >
                  {joinLoading === challenge.id ? "..." : challenge.joined ? "Active" : "Commit"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ChallengesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded-lg animate-shimmer" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white border border-border-light rounded-2xl animate-shimmer h-72" />)}
      </div>
    </div>
  );
}
