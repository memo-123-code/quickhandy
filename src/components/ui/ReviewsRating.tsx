"use client";

import React, { useState } from "react";
import { Star, MessageSquare, CheckCircle2 } from "lucide-react";

interface ReviewsRatingProps {
  workerName: string;
  jobTitle: string;
  onSubmitReview: (rating: number, comment: string) => void;
}

export default function ReviewsRating({ workerName, jobTitle, onSubmitReview }: ReviewsRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setIsSubmitted(true);
    onSubmitReview(rating, comment);
  };

  if (isSubmitted) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-4 shadow-lg animate-fadeIn">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <div className="text-center">
          <h3 dir="auto" className="text-base font-bold text-white">Review Submitted!</h3>
          <p dir="auto" className="text-xs text-slate-400 mt-1">Thank you for rating {workerName}. Your feedback helps maintain our quality standards.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg space-y-5">
      <div className="space-y-1">
        <h3 dir="auto" className="text-sm font-bold text-white">Rate your experience</h3>
        <p dir="auto" className="text-xs text-slate-400">How was the {jobTitle} service provided by {workerName}?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Star Rating */}
        <div className="flex items-center gap-2 justify-center py-4 bg-slate-950/50 rounded-xl border border-slate-850">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
            >
              <Star 
                className={`w-8 h-8 transition-colors ${
                  (hoverRating || rating) >= star 
                    ? "fill-brand-gold-500 text-brand-gold-500 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" 
                    : "text-slate-700"
                }`} 
              />
            </button>
          ))}
        </div>

        {/* Comment Area */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Additional Comments (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you liked or what could be improved..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 resize-none h-24 placeholder:text-slate-600"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={rating === 0}
          className="w-full py-3 bg-brand-blue-600 hover:bg-brand-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed font-bold text-sm text-white rounded-xl transition-all shadow-lg shadow-brand-blue-500/10"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}
