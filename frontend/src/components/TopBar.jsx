import React from 'react';
import { Search, Bell, Sparkles, UploadCloud, ShieldCheck } from 'lucide-react';

export default function TopBar({ 
  onUploadClick, 
  currentViewState, 
  onSwitchState,
  searchQuery,
  onSearchChange 
}) {
  return (
    <header className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2EAE4] shadow-soft flex flex-wrap items-center justify-between gap-4">
      {/* Search / Greeting Area */}
      <div className="flex items-center gap-3 flex-1 min-w-[240px]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search biomarkers (e.g. Hemoglobin, Glucose, TSH)..."
            className="w-full bg-[#F4F7F4] text-xs sm:text-sm text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-2xl border border-transparent focus:border-[#6E9677] focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* State Switcher Pills (for demo reviewers) */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold bg-[#F4F7F4] p-1.5 rounded-2xl border border-[#E2EAE4]">
        <span className="text-slate-500 font-medium px-2 hidden sm:inline">Preview:</span>
        <button
          onClick={() => onSwitchState('idle')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            currentViewState === 'idle'
              ? 'bg-[#2D5A43] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          Upload Area
        </button>
        <button
          onClick={() => onSwitchState('empty')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            currentViewState === 'empty'
              ? 'bg-[#2D5A43] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          Empty
        </button>
        <button
          onClick={() => onSwitchState('loading')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            currentViewState === 'loading'
              ? 'bg-[#2D5A43] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          Loading
        </button>
        <button
          onClick={() => onSwitchState('error')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            currentViewState === 'error'
              ? 'bg-rose-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
          }`}
        >
          Error
        </button>
        <button
          onClick={() => onSwitchState('results')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            currentViewState === 'results'
              ? 'bg-[#2D5A43] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          Results
        </button>
      </div>

      {/* Upload Action Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onUploadClick}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#2D5A43] hover:bg-[#244532] text-white font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md"
        >
          <UploadCloud className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Report</span>
        </button>
      </div>
    </header>
  );
}
