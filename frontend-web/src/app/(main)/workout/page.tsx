"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, CheckCircle, Loader2, Zap } from "lucide-react";
import { dataService } from "@/lib/data-service";

const activityTypes = [
  { id: "Running", icon: "🏃", desc: "Cardio & endurance", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { id: "Strength", icon: "🏋️", desc: "Muscle & power", color: "border-violet-200 bg-violet-50 text-violet-700" },
  { id: "HIIT", icon: "🔥", desc: "High intensity", color: "border-amber-200 bg-amber-50 text-amber-700" },
  { id: "Yoga", icon: "🧘", desc: "Flexibility & calm", color: "border-sky-200 bg-sky-50 text-sky-700" },
];

export default function WorkoutPage() {
  const [activityType, setActivityType] = useState("Running");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(file); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await dataService.submitWorkout({ type: activityType, duration: parseInt(duration), notes: notes || `Completed ${activityType} session!`, proof: imagePreview });
      setResult(res);
      setDuration(""); setNotes(""); setImagePreview(null);
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  if (result) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto">
        <div className="card p-10 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200/50">
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Workout Verified!</h2>
          <p className="text-sm text-slate-500 mb-1">
            {result.is_verified !== false ? "AI Coach verified your session. Keep the streak alive!" : "Your session has been logged for review."}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 mb-6">
            <span className="badge bg-emerald-50 text-emerald-700">{result.log.type}</span>
            <span className="text-sm text-slate-400">&middot;</span>
            <span className="text-sm font-bold text-slate-700">{result.log.duration} mins</span>
          </div>
          <button onClick={() => setResult(null)} className="btn-primary">Log Another Workout</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">Log Workout</h1>
          <p className="text-sm text-slate-500">AI Coach verifies each session for authenticity and fraud detection.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Type */}
          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-slate-500 block mb-3">Activity Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activityTypes.map(at => (
                <motion.button
                  key={at.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActivityType(at.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    activityType === at.id ? `${at.color} border-current` : "border-slate-100 hover:border-slate-200 bg-slate-50"
                  }`}
                >
                  <span className="text-2xl block mb-1">{at.icon}</span>
                  <span className={`text-xs font-bold block ${activityType === at.id ? "text-current" : "text-slate-600"}`}>{at.id}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{at.desc}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-slate-500 block mb-2">Duration (minutes)</label>
            <input type="number" required value={duration} onChange={e => setDuration(e.target.value)}
              placeholder="e.g. 45" className="input-field" />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-slate-500 block mb-2">Session Notes</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="How did you feel? Any challenges during the session?"
              className="input-field resize-none" />
          </div>

          {/* Image Proof */}
          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-slate-500 block mb-2">Screenshot Proof (Optional)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 text-center hover:border-emerald-300 transition-colors">
              <Camera className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600 mb-1">Upload workout screenshot</p>
              <p className="text-xs text-slate-400 mb-4">JPG or PNG &bull; From your smartwatch or gym selfie</p>
              <input type="file" id="proof" accept="image/*" onChange={handleFileChange} className="hidden" />
              <label htmlFor="proof" className="btn-secondary text-xs cursor-pointer inline-flex">Choose Image</label>
            </div>
            {imagePreview && (
              <div className="mt-3 card p-3 flex items-center gap-3">
                <img src={imagePreview} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">Proof attached</p>
                  <p className="text-[10px] text-slate-400">Ready for AI verification</p>
                </div>
                <button type="button" onClick={() => setImagePreview(null)} className="text-xs font-bold text-rose-500 hover:text-rose-600">Remove</button>
              </div>
            )}
          </div>

          {/* Submit */}
          <motion.button type="submit" disabled={isSubmitting} whileTap={{ scale: 0.98 }}
            className="btn-primary w-full py-4 shadow-lg shadow-emerald-200/50 disabled:opacity-50">
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating with AI...</>
            ) : (
              <><Zap className="w-5 h-5" /> Authenticate & Publish Log</>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
