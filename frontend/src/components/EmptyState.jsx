import React from 'react';
import { FileUp, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export default function EmptyState({ onUploadClick, onSampleClick }) {
  return (
    <div className="glass-card border-dashed border-2 border-purple-300/80 p-8 sm:p-14 text-center space-y-6 animate-fadeIn max-w-xl mx-auto shadow-lg shadow-purple-500/5">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-purple-500/25">
        <FileUp className="w-8 h-8 stroke-[2.5]" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          No Laboratory Report Loaded
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Upload a physical lab report scan (JPG, PNG) or digital PDF (max 10MB) to generate an educational plain-language breakdown.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={onUploadClick}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm transition-all shadow-md shadow-cyan-600/20 hover:scale-[1.02]"
        >
          <FileUp className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Lab Report</span>
        </button>

        <button
          onClick={onSampleClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-800 font-bold text-xs sm:text-sm transition-all shadow-xs border border-white/90 hover:border-purple-300"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Load Sample CBC</span>
        </button>
      </div>

      <div className="pt-2 text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Strict client-side demo validation. No patient data is transmitted.</span>
      </div>
    </div>
  );
}
