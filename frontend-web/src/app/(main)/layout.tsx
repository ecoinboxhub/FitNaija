"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Trophy, PlusCircle, Users, User,
  Dumbbell, Sparkles, Menu, X, LogOut,
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

  useEffect(() => {
    dataService.getProfile().then(p => setXp(p.xp || 0)).catch(() => {});
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("fitnaija-access-token");
    localStorage.removeItem("fitnaija-refresh-token");
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-border-light z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-brand tracking-tight hidden sm:block">FitNaija</span>
          </motion.button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-bg-soft rounded-2xl p-1">
            {tabs.map(tab => {
              const active = currentTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(tab.href)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    active ? "text-white" : "text-text-muted hover:text-text-dark"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-brand rounded-xl"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
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
              className="hidden sm:flex items-center gap-1.5 bg-brand-light text-brand px-3 py-1.5 rounded-full text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {xp} XP
            </motion.div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="text-text-muted hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors hidden sm:block"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-text-dark"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            className="md:hidden bg-white border-b border-border-light overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {tabs.map(tab => {
                const active = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { router.push(tab.href); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      active ? "bg-brand text-white" : "text-text-dark hover:bg-bg-soft"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
              <hr className="border-border-light my-2" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" /> Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-8">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-border-light z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map(tab => {
            const active = currentTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push(tab.href)}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                  active ? "text-brand" : "text-text-muted"
                }`}
              >
                <div className={`relative p-1.5 rounded-lg ${active ? "bg-brand-light" : ""}`}>
                  {active && (
                    <motion.div
                      layoutId="bottom-dot"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <tab.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
