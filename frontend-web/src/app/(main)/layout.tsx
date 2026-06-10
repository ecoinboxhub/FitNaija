"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Trophy, PlusCircle, Users, User,
  Dumbbell, Sparkles, LogOut,
} from "lucide-react";
import { dataService } from "@/lib/data-service";

const tabs = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { id: "challenges", label: "Challenges", icon: Trophy, href: "/challenges" },
  { id: "workout", label: "Log", icon: PlusCircle, href: "/workout" },
  { id: "feed", label: "Community", icon: Users, href: "/feed" },
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentTab = tabs.find(t => pathname.startsWith(t.href))?.id || "dashboard";
  const [xp, setXp] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    dataService.getProfile().then(p => setXp(p.xp || 0)).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("fitnaija-access-token");
    localStorage.removeItem("fitnaija-refresh-token");
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm" : "bg-white"
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-emerald-200 transition-transform group-hover:scale-105">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight hidden sm:block">
              Fit<span className="text-emerald-600">Naija</span>
            </span>
          </motion.button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 rounded-2xl p-1">
            {tabs.map(tab => {
              const active = currentTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(tab.href)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    active ? "text-white" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 gradient-brand rounded-xl shadow-md"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200/50"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              {xp} XP
            </motion.div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-all text-xs font-medium"
            >
              <LogOut className="w-4 h-4" /> Exit
            </motion.button>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100"
            >
              <div className={`w-5 h-0.5 bg-slate-600 rounded-full transition-all ${menuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'}`} />
              <div className={`w-5 h-0.5 bg-slate-600 rounded-full transition-all ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <div className={`w-5 h-0.5 bg-slate-600 rounded-full transition-all ${menuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden shadow-lg"
          >
            <div className="px-4 py-3 space-y-1">
              {tabs.map(tab => {
                const active = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { router.push(tab.href); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      active ? "gradient-brand text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
              <hr className="border-slate-100 my-2" />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50">
                <LogOut className="w-5 h-5" /> Log Out
              </button>
              <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold text-slate-600">{xp} XP</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-8">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map(tab => {
            const active = currentTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push(tab.href)}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 ${
                  active ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                <div className={`relative p-1.5 rounded-lg ${active ? "bg-emerald-50" : ""}`}>
                  {active && (
                    <motion.div
                      layoutId="bottom-dot"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold leading-none">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
