import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import HistoryModal from './components/HistoryModal';
import { MOCK_REPORTS } from './data/mockReports';
import { Stethoscope, ShieldCheck, BookOpen, Sparkles, HelpCircle, Layers, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'landing' | 'dashboard' | 'doctor-prep' | 'glossary'
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [customReport, setCustomReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // View states for Dashboard: 'idle' | 'empty' | 'loading' | 'error' | 'results'
  const [dashboardViewState, setDashboardViewState] = useState('idle');

  const handleSelectSample = (sampleId) => {
    setSelectedSampleId(sampleId);
    setCustomReport(null);
    setActiveTab('dashboard');
    setDashboardViewState('results');
  };

  const handleSelectSavedReport = (savedReport) => {
    setCustomReport(savedReport);
    setSelectedSampleId(null);
    setActiveTab('dashboard');
    setDashboardViewState('results');
  };

  const handleUploadClick = () => {
    setActiveTab('dashboard');
    setDashboardViewState('idle');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col relative overflow-hidden">
      {/* Ambient Glowing Background Orbs for Translucency Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft Pink / Rose Orb - Top Left */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-gradient-to-br from-rose-300/35 via-pink-400/25 to-transparent rounded-full blur-[100px] animate-pulse-slow" />
        
        {/* Electric Cyan / Sky Orb - Top Right */}
        <div className="absolute -top-24 right-[-10%] w-[620px] h-[620px] bg-gradient-to-bl from-cyan-300/35 via-sky-400/20 to-transparent rounded-full blur-[120px]" />
        
        {/* Violet / Purple Orb - Mid Right */}
        <div className="absolute top-[35%] -right-24 w-[500px] h-[500px] bg-gradient-to-tl from-purple-400/25 via-indigo-300/20 to-transparent rounded-full blur-[110px]" />
        
        {/* Emerald / Mint Orb - Mid Left */}
        <div className="absolute top-[45%] -left-28 w-[480px] h-[480px] bg-gradient-to-tr from-emerald-300/25 via-teal-300/20 to-transparent rounded-full blur-[110px]" />
        
        {/* Warm Amber / Peach Orb - Bottom Center */}
        <div className="absolute -bottom-36 left-[25%] w-[600px] h-[600px] bg-gradient-to-t from-amber-300/25 via-orange-300/20 to-transparent rounded-full blur-[120px]" />
      </div>

      {/* Top Navbar Header with Frosted Glassmorphism */}
      <Navbar
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          if (tab === 'dashboard') {
            setDashboardViewState('idle');
          }
        }}
        onUploadClick={handleUploadClick}
        onSelectSample={handleSelectSample}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* State Switcher & Search Bar for Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="glass-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[240px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search biomarkers (e.g. Hemoglobin, Glucose, TSH, Cholesterol)..."
                className="w-full glass-input text-xs sm:text-sm text-slate-800 placeholder-slate-400 px-4 py-2.5 rounded-2xl focus:outline-none"
              />
            </div>

            {/* State Switcher Pills with Distinct Colors */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold bg-white/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 shadow-xs">
              <span className="text-slate-500 font-medium px-2.5 hidden sm:inline flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-600" />
                Preview States:
              </span>
              
              <button
                onClick={() => setDashboardViewState('idle')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  dashboardViewState === 'idle'
                    ? 'bg-gradient-to-r from-sky-500 to-medcare-600 text-white font-bold shadow-md shadow-sky-500/20 scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Upload Area
              </button>

              <button
                onClick={() => setDashboardViewState('empty')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  dashboardViewState === 'empty'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-md shadow-purple-500/20 scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Empty State
              </button>

              <button
                onClick={() => setDashboardViewState('loading')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  dashboardViewState === 'loading'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-md shadow-amber-500/20 scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Loading State
              </button>

              <button
                onClick={() => setDashboardViewState('error')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  dashboardViewState === 'error'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-md shadow-rose-500/20 scale-105'
                    : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50/70'
                }`}
              >
                Error State
              </button>

              <button
                onClick={() => setDashboardViewState('results')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  dashboardViewState === 'results'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/20 scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Results View
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Tab Views */}
        <div>
          {activeTab === 'landing' && (
            <LandingPage
              onGoToDashboard={() => {
                setActiveTab('dashboard');
                setDashboardViewState('idle');
              }}
              onSelectSample={handleSelectSample}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              initialSampleId={selectedSampleId}
              initialCustomReport={customReport}
              searchQuery={searchQuery}
              viewState={dashboardViewState}
              setViewState={setDashboardViewState}
              onBackToLanding={() => setActiveTab('landing')}
            />
          )}

          {activeTab === 'doctor-prep' && (
            <div className="glass-card p-6 sm:p-8 space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200/60">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
                  <Stethoscope className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      Doctor Consultation Preparation Guide
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                      Clinical Prep
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    High-yield, patient-empowered questions to discuss with your healthcare provider
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_REPORTS[0].doctorQuestions.concat(MOCK_REPORTS[1].doctorQuestions).map((item, idx) => {
                  const colors = [
                    'border-cyan-200/80 bg-cyan-50/50 hover:border-cyan-400',
                    'border-rose-200/80 bg-rose-50/50 hover:border-rose-400',
                    'border-purple-200/80 bg-purple-50/50 hover:border-purple-400',
                    'border-amber-200/80 bg-amber-50/50 hover:border-amber-400'
                  ];
                  const colorClass = colors[idx % colors.length];

                  return (
                    <div key={idx} className={`p-4 sm:p-5 rounded-2xl border transition-all ${colorClass} backdrop-blur-md`}>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white text-slate-700 text-xs flex items-center justify-center font-bold shadow-xs">
                          {idx + 1}
                        </span>
                        {item.question}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-7">
                        <strong className="text-slate-800">Why ask this:</strong> {item.reason}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-3">
                <button
                  onClick={() => handleSelectSample('report-cbc-glucose')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-medcare-600 to-cyan-600 hover:from-medcare-700 hover:to-cyan-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-600/25 hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View in Sample Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className="glass-card p-6 sm:p-8 space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200/60">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20">
                  <BookOpen className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      Medical Diagnostic Glossary
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      Plain English
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Clinical acronyms and biomarker terminology simplified for everyday understanding
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_REPORTS[0].glossary.concat(MOCK_REPORTS[1].glossary).concat(MOCK_REPORTS[2].glossary).map((item, idx) => {
                  const tagColors = [
                    'text-rose-700 bg-rose-50 border-rose-200',
                    'text-cyan-700 bg-cyan-50 border-cyan-200',
                    'text-purple-700 bg-purple-50 border-purple-200',
                    'text-amber-700 bg-amber-50 border-amber-200',
                    'text-emerald-700 bg-emerald-50 border-emerald-200'
                  ];
                  const tagColor = tagColors[idx % tagColors.length];

                  return (
                    <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 hover:border-purple-300 shadow-xs space-y-2 transition-all hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm sm:text-base text-slate-900">
                          {item.term}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagColor}`}>
                          Definition
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {item.meaning}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-3">
                <button
                  onClick={() => handleSelectSample('report-cbc-glucose')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-purple-600/25 hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Explore in Live CBC Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectReport={handleSelectSavedReport}
      />

      {/* Translucent Frosted Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/70 backdrop-blur-xl py-8 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-medcare-600 text-white flex items-center justify-center font-bold shadow-md shadow-cyan-500/20">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="font-black text-sm text-slate-900 tracking-tight">
                Report<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-medcare-600">Saathi</span>
              </span>
              <span>&bull;</span>
              <span className="font-medium text-slate-600">Educational Health Literacy Web Platform</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">WCAG AA Compliant &bull; Non-Diagnostic</span>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed max-w-4xl">
            EDUCATIONAL USE ONLY: ReportSaathi provides educational simplifications of medical laboratory reports and does not diagnose, prescribe treatment, or claim clinical certainty. Laboratory reference intervals vary between clinical facilities, test methodologies, and patient baseline. Always consult a qualified clinician.
          </p>
        </div>
      </footer>
    </div>
  );
}
