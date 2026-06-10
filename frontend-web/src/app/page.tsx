"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, KeyRound, ArrowRight, Dumbbell, Zap, Shield, Users, ChevronRight } from "lucide-react";
import { dataService } from "@/lib/data-service";

const features = [
  { icon: Zap, label: "AI Coach", desc: "Smart training plans" },
  { icon: Shield, label: "Verified", desc: "Gemini photo checks" },
  { icon: Users, label: "Community", desc: "Abuja network" },
];

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.length < 10) { setError("Enter a valid Nigerian phone number"); return; }
    setLoading(true);
    try {
      const formatted = phone.startsWith("+234") ? phone : "+234" + phone.replace(/^0+/, "");
      await dataService.sendOtp(formatted);
      setStep("otp");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length < 4) { setError("Enter the OTP code"); return; }
    setLoading(true);
    try {
      const formatted = phone.startsWith("+234") ? phone : "+234" + phone.replace(/^0+/, "");
      await dataService.verifyOtp(formatted, otp);
      router.push("/dashboard");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                          radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Floating shapes */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-emerald-400 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-teal-300 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Logo Area */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20"
            >
              <Dumbbell className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-4xl font-bold text-white tracking-tight"
            >
              FitNaija
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-emerald-100/80 text-sm mt-1.5 font-medium"
            >
              Abuja&apos;s Elite Fitness Accountability
            </motion.p>
          </div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-900/30 p-8"
          >
            <AnimatePresence mode="wait">
              {step === "phone" ? (
                <motion.form
                  key="phone"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-xs uppercase font-bold tracking-wider text-slate-500 block mb-2">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="080 1234 5678"
                        className="input-field pl-12"
                        autoFocus
                      />
                    </div>
                  </div>
                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-500 text-xs font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> {error}
                    </motion.p>
                  )}
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm">
                    {loading ? "Sending OTP..." : "Continue with Phone"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-slate-400 text-center">OTP via Termii SMS &bull; Test code: 1234</p>
                </motion.form>
              ) : (
                <motion.form
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-xs uppercase font-bold tracking-wider text-slate-500 block mb-2">
                      Enter OTP Code
                    </label>
                    <div className="relative group">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="input-field pl-12 text-center text-2xl tracking-[0.4em] font-mono"
                        autoFocus
                      />
                    </div>
                  </div>
                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-500 text-xs font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> {error}
                    </motion.p>
                  )}
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm">
                    {loading ? "Verifying..." : "Verify & Enter"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => { setStep("phone"); setError(""); }} className="w-full text-xs text-slate-400 hover:text-emerald-600 font-semibold transition-colors">
                    Change phone number
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-2 mt-6"
          >
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.08 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2.5 border border-white/10"
              >
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white text-xs font-bold">{label}</div>
                  <div className="text-white/60 text-[10px]">{desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-6">
        <p className="text-emerald-200/50 text-xs font-medium">Powered by AI &bull; Built for Abuja</p>
      </div>
    </div>
  );
}
