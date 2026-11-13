import React from 'react';
import { Stethoscope, ShieldCheck, UploadCloud, Home, LayoutDashboard, Sparkles, BookOpen, Bookmark } from 'lucide-react';

export default function Navbar({ activeTab, onNavigate, onUploadClick, onSelectSample, onOpenHistory }) {
  const navTabs = [
    { id: 'landing', label: 'Home', icon: Home, activeColor: 'text-rose-700 bg-rose-50/80 border-rose-200/80' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, activeColor: 'text-cyan-800 bg-cyan-50/80 border-cyan-200/80' },
    { id: 'doctor-prep', label: 'Doctor Prep', icon: Stethoscope, activeColor: 'text-emerald-800 bg-emerald-50/80 border-emerald-200/80' },
    { id: 'glossary', label: 'Glossary', icon: BookOpen, activeColor: 'text-purple-800 bg-purple-50/80 border-purple-200/80' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/75 backdrop-blur-2xl border-b border-white/80 shadow-[0_4px_20px_0_rgba(31,38,135,0.05)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand with Glowing Translucent Badge */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-all">
            <Stethoscope className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-slate-900">
                Report<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">Saathi</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50/80 text-cyan-800 border border-cyan-200/80 shadow-xs">
                <ShieldCheck className="w-3 h-3 mr-1 text-cyan-600" />
                Educational
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
              Medical Laboratory Explainer
            </p>
          </div>
        </button>

        {/* Center Navigation Links with Frosted Pills */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/80 shadow-xs">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 text-xs sm:text-sm font-semibold border ${
                  isActive
                    ? `${tab.activeColor} font-bold shadow-xs scale-[1.02]`
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-current' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Buttons with Frosted Accents */}
        <div className="flex items-center gap-2.5">
          {/* Saved Reports / History Button */}
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white/80 hover:bg-white border border-white/90 transition-all shadow-xs backdrop-blur-md hover:border-cyan-300"
            title="View saved report history"
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Saved Reports</span>
          </button>

          <button
            onClick={() => onSelectSample('report-cbc-glucose')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white/70 hover:bg-white/95 border border-white/80 transition-all shadow-xs backdrop-blur-md hover:border-cyan-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Try Demo CBC</span>
          </button>

          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-600/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Report</span>
          </button>
        </div>
      </div>
    </header>
  );
}
