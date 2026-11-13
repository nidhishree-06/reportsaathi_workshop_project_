import React, { useState, useEffect } from 'react';
import { Loader2, FileSearch, Sparkles, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { text: "Validating file integrity & size limits (< 10MB)...", color: "text-cyan-700" },
  { text: "Simulating OCR text extraction & biomarker detection...", color: "text-purple-700" },
  { text: "Mapping diagnostic parameters to clinical reference intervals...", color: "text-amber-700" },
  { text: "Formatting everyday plain-language explanations...", color: "text-emerald-700" }
];

export default function LoadingState({ fileName }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 550);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-8 sm:p-12 text-center space-y-6 animate-fadeIn max-w-xl mx-auto border border-white/85 shadow-xl">
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-cyan-100 border-t-cyan-600 animate-spin" />
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/25">
          <FileSearch className="w-6 h-6 stroke-[2.5]" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Analyzing Laboratory Report
        </h3>
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Processing <span className="text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-200">{fileName || "uploaded_report.pdf"}</span>
        </p>
      </div>

      {/* Progress Steps List with Frosted Accents */}
      <div className="space-y-2.5 max-w-md mx-auto text-left pt-2">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                isDone
                  ? "bg-emerald-50/70 border border-emerald-200/70 text-emerald-800 font-semibold"
                  : isCurrent
                  ? "bg-white/80 border border-cyan-300 text-slate-900 font-bold shadow-xs scale-[1.01]"
                  : "bg-transparent text-slate-400"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-600 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
              )}
              <span className="text-xs">{step.text}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-xs text-slate-400 font-medium">
        Educational Demo &bull; Simulating report translation with realistic laboratory datasets
      </div>
    </div>
  );
}
