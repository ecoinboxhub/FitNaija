"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, KeyRound, ArrowRight, Dumbbell, Sparkles, Shield, Users } from "lucide-react";
import { dataService } from "@/lib/data-service";

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-900 via-brand to-emerald-700">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand/30"
            >
              <Dumbbell className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-3xl font-bold text-center text-text-dark mb-1">FitNaija</h1>
            <p className="text-sm text-text-muted text-center mb-8">Abuja&apos;s Elite Fitness Accountability</p>

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
                    <label className="text-xs uppercase font-bold tracking-wider text-text-muted block mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="08012345678"
                        className="w-full bg-bg-soft border border-border-light rounded-xl p-4 pl-12 text-sm font-semibold text-text-dark outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-brand/25 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-text-muted text-center">OTP via Termii SMS • Test code: 1234</p>
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
                    <label className="text-xs uppercase font-bold tracking-wider text-text-muted block mb-2">
                      Enter OTP Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full bg-bg-soft border border-border-light rounded-xl p-4 pl-12 text-sm font-semibold text-text-dark outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all text-center text-2xl tracking-[0.5em]"
                        autoFocus
                      />
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-brand/25 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? "Verifying..." : "Verify & Enter"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep("phone"); setError(""); }}
                    className="w-full text-xs text-text-muted hover:text-brand font-semibold transition-colors"
                  >
                    Change phone number
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-3 mt-6"
          >
            {[
              { icon: Sparkles, label: "AI Coach", desc: "Personal guidance" },
              { icon: Shield, label: "Verified", desc: "Gemini proof checks" },
              { icon: Users, label: "Community", desc: "Abuja network" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <Icon className="w-5 h-5 text-white mx-auto mb-1" />
                <div className="text-white text-xs font-bold">{label}</div>
                <div className="text-white/70 text-[10px]">{desc}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
