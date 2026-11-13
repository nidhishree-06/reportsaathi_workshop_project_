import React from 'react';
import { AlertOctagon, RotateCcw, ArrowLeft } from 'lucide-react';

export default function ErrorState({ error, onRetry, onReset }) {
  const errorTitle = error?.title || "Unable to Process Document";
  const errorMessage = error?.message || "An unexpected issue occurred while validating the uploaded file.";
  const errorDetails = error?.details || "Please make sure your report is in PDF, JPG, or PNG format and smaller than 10MB.";

  return (
    <div className="glass-rose border border-rose-300/80 rounded-3xl p-8 sm:p-10 max-w-xl mx-auto space-y-6 text-center shadow-xl shadow-rose-500/10 animate-shake">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center mx-auto shadow-md shadow-rose-500/25">
        <AlertOctagon className="w-8 h-8 stroke-[2.5]" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight">
          {errorTitle}
        </h3>
        <p className="text-sm text-rose-800 font-bold">
          {errorMessage}
        </p>
        <p className="text-xs text-slate-600 max-w-md mx-auto pt-1 leading-relaxed">
          {errorDetails}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm transition-all shadow-md shadow-rose-600/25 hover:scale-[1.02]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-700 border border-white/90 font-bold text-xs sm:text-sm transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Return to Dashboard</span>
          </button>
        )}
      </div>
    </div>
  );
}
