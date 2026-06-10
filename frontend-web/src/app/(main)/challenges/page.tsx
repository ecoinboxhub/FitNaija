"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Users, Clock, Sparkles, ChevronRight, Search } from "lucide-react";
import { dataService } from "@/lib/data-service";

const categories = [
  { id: "all", label: "All", color: "bg-slate-800 text-white" },
  { id: "Running", label: "🏃 Running", color: "bg-emerald-50 text-emerald-700" },
  { id: "Strength", label: "🏋️ Strength", color: "bg-violet-50 text-violet-700" },
  { id: "HIIT", label: "🔥 HIIT", color: "bg-amber-50 text-amber-700" },
  { id: "Yoga", label: "🧘 Yoga", color: "bg-sky-50 text-sky-700" },
];

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-rose-100 text-rose-700",
};

export default function ChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dataService.getChallenges().then(setChallenges).finally(() => setLoading(false));
  }, []);

  const handleJoin = async (id: string) => {
    setJoinLoading(id);
    await dataService.joinChallenge(id);
    setChallenges(await dataService.getChallenges());
    setJoinLoading(null);
  };

  const filtered = challenges.filter(c => {
    if (filter !== "all" && c.category !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <ChallengesSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Challenges</h1>
          <p className="text-sm text-slate-500 mt-1">{challenges.length} active challenges across Abuja</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search challenges..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === cat.id ? cat.color + " shadow-md" : "card text-slate-500 hover:text-slate-700"
            }`}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((challenge, i) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -4 }}
            className="card overflow-hidden group"
          >
            {/* Accent bar */}
            <div className={`h-1.5 ${
              challenge.difficulty === "Beginner" ? "gradient-warm" :
              challenge.difficulty === "Intermediate" ? "gradient-brand" : "gradient-cool"
            }`} />

            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="badge bg-emerald-50 text-emerald-700">{challenge.category}</span>
                <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                  <Users className="w-3.5 h-3.5" /> {challenge.participantsCount}
                </span>
              </div>

              <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">{challenge.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{challenge.description}</p>

              <div className="space-y-1.5 mb-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Difficulty</span>
                  <span className={`badge ${difficultyColors[challenge.difficulty] || "bg-slate-100 text-slate-600"}`}>{challenge.difficulty}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1"><Clock className="w-3 h-3" /> {challenge.durationDays} days</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Reward</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1"><Sparkles className="w-3 h-3" /> {challenge.xpReward} XP</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/challenges/${challenge.id}`)}
                  className="flex-1 text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                >
                  Details <ChevronRight className="w-3 h-3" />
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleJoin(challenge.id)}
                  disabled={joinLoading === challenge.id}
                  className={`flex-1 text-xs font-bold px-3 py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center ${
                    challenge.joined ? "bg-slate-800 text-white hover:bg-emerald-600" : "gradient-brand text-white shadow-md shadow-emerald-200/50"
                  }`}
                >
                  {joinLoading === challenge.id ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : challenge.joined ? "Active" : "Commit"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-1">No challenges found</h3>
          <p className="text-sm text-slate-400">Try a different filter or check back later</p>
        </div>
      )}
    </div>
  );
}

function ChallengesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 skeleton" />
      <div className="flex gap-2">
        {[1,2,3,4].map(i => <div key={i} className="h-9 w-20 skeleton rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1,2,3,4,5,6].map(i => <div key={i} className="card skeleton h-72" />)}
      </div>
    </div>
  );
}
