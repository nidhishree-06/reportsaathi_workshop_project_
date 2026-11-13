import React from 'react';
import { AlertCircle, HeartHandshake } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-amber-900">
              Educational & Informational Purpose Only
            </h4>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
              <HeartHandshake className="w-3 h-3" />
              Doctor-First Tool
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
            ReportSaathi translates dense medical terminology into easy-to-read explanations to help you prepare questions for your doctor. 
            <strong> It does not provide medical diagnoses, treatment plans, or clinical prescriptions.</strong> Always consult a qualified medical professional to interpret your lab reports in the context of your personal health history.
          </p>
        </div>
      </div>
    </div>
  );
}
