import React, { useState } from 'react';

export default function WorkoutForm({ onSubmit }) {
  const [activityType, setActivityType] = useState('Running');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!duration || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        type: activityType,
        duration: parseInt(duration),
        notes: notes || `Completed intense ${activityType} routine!`,
        proof: imagePreview
      });
      // Reset form on success
      setDuration('');
      setNotes('');
      setImagePreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-borderLight p-6 md:p-8 rounded-xl shadow-xs">
      
      <div className="mb-6">
        <h2 className="text-3xl font-serif font-bold text-textDark mb-1">Verify Workout Log</h2>
        <p className="text-sm text-textMuted">Log details of your physical session. Your AI coach evaluates authenticity dynamically.</p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        
        {/* Activity selector */}
        <div>
          <label className="text-xs uppercase font-extrabold tracking-wider text-textDark block mb-2">Activity Profile</label>
          <select 
            value={activityType} 
            onChange={(e) => setActivityType(e.target.value)}
            className="w-full bg-bgSoft border border-borderLight rounded-lg p-3 text-sm font-semibold text-textDark outline-none focus:border-brand"
          >
            <option value="Running">Running Session</option>
            <option value="Strength">Strength / Weights Day</option>
            <option value="HIIT">HIIT Cardio Burnout</option>
            <option value="Yoga">Yoga and Stretching Flow</option>
          </select>
        </div>

        {/* Duration input */}
        <div>
          <label className="text-xs uppercase font-extrabold tracking-wider text-textDark block mb-2">Duration (Minutes)</label>
          <input 
            type="number" 
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 45"
            className="w-full bg-bgSoft border border-borderLight rounded-lg p-3 text-sm font-semibold text-textDark outline-none focus:border-brand"
          />
        </div>

        {/* Workout notes */}
        <div>
          <label className="text-xs uppercase font-extrabold tracking-wider text-textDark block mb-2">Self-Observation Notes</label>
          <textarea 
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detail how you felt, weather conditions or weight sets completed..."
            className="w-full bg-bgSoft border border-borderLight rounded-lg p-3 text-sm font-semibold text-textDark outline-none focus:border-brand resize-none"
          ></textarea>
        </div>

        {/* Image proof input */}
        <div>
          <label className="text-xs uppercase font-extrabold tracking-wider text-textDark block mb-2">Optional Screenshot Proof (Preview Only)</label>
          <div className="border border-dashed border-borderLight rounded-lg p-4 bg-bgSoft flex flex-col items-center justify-center text-center">
            <i data-lucide="camera" className="w-8 h-8 text-textMuted mb-2"></i>
            <span className="text-xs font-semibold text-textDark mb-1">Upload smartwatch run trail or gym selfie</span>
            <span className="text-[10px] text-textMuted mb-3">JPG or PNG format</span>
            
            <input 
              type="file" 
              id="proof-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden" 
            />
            <label 
              htmlFor="proof-upload"
              className="bg-white hover:bg-bgSoft border border-borderLight text-xs font-bold px-4 py-2 rounded-md cursor-pointer inline-block"
            >
              Select Image File
            </label>
          </div>

          {imagePreview && (
            <div className="mt-4 p-3 bg-white border border-borderLight rounded-lg">
              <span className="text-xs font-bold text-textDark block mb-2">Attachment Preview:</span>
              <img src={imagePreview} alt="Proof preview" className="max-h-48 w-auto rounded-md object-contain border border-borderLight" />
              <button 
                type="button" 
                onClick={() => setImagePreview(null)}
                className="text-xs font-bold text-red-500 hover:underline mt-2 block"
              >
                Remove attachment
              </button>
            </div>
          )}
        </div>

        {/* CTA button */}
        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand hover:bg-brand-hover text-white text-sm font-bold py-3.5 rounded-lg transition-transform hover:-translate-y-0.5 shadow-md shadow-brand/20 disabled:opacity-50"
        >
          {isSubmitting ? 'Authenticating and Publishing...' : 'Authenticate and Publish Log'}
        </button>

      </form>
    </div>
  );
}
