"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Camera, CheckCircle, Loader2 } from "lucide-react";
import { dataService } from "@/lib/data-service";

const activityTypes = [
  { id: "Running", icon: "🏃", color: "bg-green-50 text-green-600 border-green-200" },
  { id: "Strength", icon: "🏋️", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { id: "HIIT", icon: "🔥", color: "bg-orange-50 text-orange-600 border-orange-200" },
  { id: "Yoga", icon: "🧘", color: "bg-purple-50 text-purple-600 border-purple-200" },
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
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await dataService.submitWorkout({
        type: activityType,
        duration: parseInt(duration),
        notes: notes || `Completed intense ${activityType} routine!`,
        proof: imagePreview,
      });
      setResult(res);
      setDuration("");
      setNotes("");
      setImagePreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center"
      >
        <div className="bg-white border border-border-light rounded-3xl p-10 shadow-sm">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold font-serif mb-2">Workout Verified!</h2>
          <p className="text-sm text-text-muted mb-2">
            {result.is_verified !== false ? "AI Coach verified your session. Keep the streak alive!" : "Your session has been logged for review."}
          </p>
          <p className="text-xs text-text-muted mb-6">
            {result.log.type} &middot; {result.log.duration} mins
          </p>
          <button
            onClick={() => setResult(null)}
            className="bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3 rounded-xl transition-all"
          >
            Log Another
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white border border-border-light rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-1">Log Workout</h1>
          <p className="text-sm text-text-muted">AI Coach verifies each session for authenticity.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Type Selector */}
          <div>
            <label className="text-xs uppercase font-extrabold tracking-wider text-text-dark block mb-3">
              Activity Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activityTypes.map(at => (
                <motion.button
                  key={at.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActivityType(at.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    activityType === at.id
                      ? "border-brand bg-brand-light"
                      : "border-border-light hover:border-brand/30 bg-bg-soft"
                  }`}
                >
                  <span className="text-2xl block mb-1">{at.icon}</span>
                  <span className={`text-xs font-bold ${activityType === at.id ? "text-brand" : "text-text-dark"}`}>
                    {at.id}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs uppercase font-extrabold tracking-wider text-text-dark block mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              required
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="e.g. 45"
              className="w-full bg-bg-soft border border-border-light rounded-xl p-4 text-sm font-semibold text-text-dark outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs uppercase font-extrabold tracking-wider text-text-dark block mb-2">
              Self Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How did you feel? Any challenges during the session?"
              className="w-full bg-bg-soft border border-border-light rounded-xl p-4 text-sm text-text-dark outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none"
            />
          </div>

          {/* Image Proof */}
          <div>
            <label className="text-xs uppercase font-extrabold tracking-wider text-text-dark block mb-2">
              Screenshot Proof (Optional)
            </label>
            <div className="border-2 border-dashed border-border-light rounded-xl p-6 bg-bg-soft text-center">
              <Camera className="w-10 h-10 text-text-muted mx-auto mb-2" />
              <p className="text-sm font-semibold text-text-dark mb-1">Upload workout screenshot</p>
              <p className="text-xs text-text-muted mb-4">JPG or PNG from your smartwatch or gym selfie</p>
              <input type="file" id="proof" accept="image/*" onChange={handleFileChange} className="hidden" />
              <label htmlFor="proof" className="inline-block bg-white border border-border-light hover:bg-bg-soft text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all">
                Select Image
              </label>
            </div>
            {imagePreview && (
              <div className="mt-3 p-3 bg-white border border-border-light rounded-xl">
                <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg object-contain mx-auto" />
                <button type="button" onClick={() => setImagePreview(null)} className="text-xs font-bold text-red-500 mt-2 hover:underline block mx-auto">
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
            ) : (
              <><Activity className="w-5 h-5" /> Authenticate & Publish Log</>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
