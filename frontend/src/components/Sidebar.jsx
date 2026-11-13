import React from 'react';
import { 
  Activity, 
  Home, 
  LayoutDashboard, 
  FileText, 
  Stethoscope, 
  BookOpen, 
  ShieldCheck, 
  UploadCloud, 
  Info,
  HelpCircle
} from 'lucide-react';

export default function Sidebar({ activeTab, onNavigate, onUploadClick }) {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'doctor-prep', label: 'Doctor Prep', icon: Stethoscope },
    { id: 'glossary', label: 'Glossary', icon: BookOpen },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#2D5A43] text-white rounded-3xl p-5 flex flex-col justify-between shadow-card border border-[#254C38] shrink-0">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-2xl bg-[#E7EFE8] text-[#2D5A43] flex items-center justify-center shadow-sm font-black">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              Report<span className="text-[#A3D9B5]">Saathi</span>
            </h1>
            <p className="text-[11px] text-[#A3D9B5]/80 font-medium">
              Lab Report Explainer
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onUploadClick}
          className="w-full py-3 px-4 rounded-2xl bg-[#E7EFE8] hover:bg-white text-[#244532] font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md hover:scale-[1.01]"
        >
          <UploadCloud className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Report</span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white/20 text-white shadow-inner font-bold'
                    : 'text-[#E7EFE8]/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#A3D9B5]' : 'text-white/70'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="mt-8 pt-4 border-t border-white/15 space-y-3">
        <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10 text-xs text-[#E7EFE8] space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#A3D9B5]" />
            <span>Educational Demo</span>
          </div>
          <p className="text-[11px] text-[#E7EFE8]/80 leading-relaxed">
            Not for clinical diagnosis. Always consult a qualified physician.
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#A3D9B5]/70 px-1 font-medium">
          <span>v1.2 &bull; Client Demo</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3D9B5] animate-pulse" />
            Active
          </span>
        </div>
      </div>
    </aside>
  );
}
