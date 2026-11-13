import React from 'react';
import { 
  Activity, 
  Heart, 
  Droplets, 
  ShieldCheck, 
  Stethoscope, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Sparkles,
  Pill,
  Clock,
  FileCheck2,
  HeartPulse,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function LandingPage({ onGoToDashboard, onSelectSample }) {
  const diagnosticPanels = [
    { 
      id: 'report-cbc-glucose',
      title: 'Complete Blood Count (CBC)', 
      desc: 'Hemoglobin, White Blood Cells & Platelet counts decoded in plain language', 
      icon: Droplets, 
      badge: 'Hematology',
      theme: 'rose',
      containerClass: 'glass-rose hover:border-rose-400',
      iconClass: 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25',
      badgeClass: 'bg-rose-100/90 text-rose-800 border-rose-200',
      textClass: 'text-rose-950',
      btnClass: 'text-rose-700 hover:text-rose-900'
    },
    { 
      id: 'report-cbc-glucose',
      title: 'Glycemic & Metabolic Panel', 
      desc: 'Fasting Blood Glucose, pre-diabetes risk indicators & HbA1c ranges', 
      icon: Activity, 
      badge: 'Metabolism',
      theme: 'amber',
      containerClass: 'glass-amber hover:border-amber-400',
      iconClass: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25',
      badgeClass: 'bg-amber-100/90 text-amber-800 border-amber-200',
      textClass: 'text-amber-950',
      btnClass: 'text-amber-700 hover:text-amber-900'
    },
    { 
      id: 'report-lipid',
      title: 'Cardiovascular Lipid Profile', 
      desc: 'Total Cholesterol, HDL "good" cholesterol, LDL & Triglycerides', 
      icon: Heart, 
      badge: 'Cardiology',
      theme: 'cyan',
      containerClass: 'glass-cyan hover:border-cyan-400',
      iconClass: 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/25',
      badgeClass: 'bg-cyan-100/90 text-cyan-800 border-cyan-200',
      textClass: 'text-cyan-950',
      btnClass: 'text-cyan-700 hover:text-cyan-900'
    },
    { 
      id: 'report-thyroid',
      title: 'Thyroid Function Panel', 
      desc: 'TSH, Free T3 & Free T4 metabolic hormone regulation markers', 
      icon: Pill, 
      badge: 'Endocrinology',
      theme: 'purple',
      containerClass: 'glass-purple hover:border-purple-400',
      iconClass: 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/25',
      badgeClass: 'bg-purple-100/90 text-purple-800 border-purple-200',
      textClass: 'text-purple-950',
      btnClass: 'text-purple-700 hover:text-purple-900'
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Upload or Select Report',
      desc: 'Drag & drop physical lab report photos (JPG, PNG) or digital PDFs. Verified under 10MB.',
      badge: 'Rose Step',
      color: 'from-rose-500 to-pink-500',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
      step: '02',
      title: 'Biomarker Extraction',
      desc: 'Digital text extraction and OCR parse biomarker names, observed values, and reference ranges.',
      badge: 'Cyan Step',
      color: 'from-cyan-500 to-sky-500',
      badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    },
    {
      step: '03',
      title: 'Educational Explanations',
      desc: 'Understand what values mean in plain everyday language, with doctor consultation questions.',
      badge: 'Emerald Step',
      color: 'from-emerald-500 to-teal-500',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
  ];

  return (
    <div className="space-y-16 animate-fadeIn pb-16 pt-2">
      {/* Hero Section with Translucent Frosted Glass & Ambient Glow */}
      <section className="relative overflow-hidden glass-card p-8 sm:p-14 border border-white/80 shadow-[0_20px_60px_-15px_rgba(31,38,135,0.08)]">
        {/* Subtle internal gradient highlight */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-cyan-400/20 via-sky-300/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-pink-400/15 via-rose-300/10 to-transparent rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/80 text-cyan-800 border border-cyan-200/80 shadow-xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
              <span>Educational Health Literacy Web Platform</span>
            </div>

            <div className="space-y-3">
              <span className="text-xs uppercase font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600 block">
                Health Literacy &bull; Non-Diagnostic &bull; Plain Language
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Demystifying medical lab reports into{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600">
                  plain language
                </span>.
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-1 max-w-xl">
                Dense diagnostic numbers and complex medical acronyms can cause unnecessary anxiety. ReportSaathi converts your lab test values into intuitive, everyday explanations with standard reference ranges.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onGoToDashboard}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base transition-all shadow-lg shadow-cyan-600/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Upload Lab Report</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={() => onSelectSample('report-cbc-glucose')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/80 hover:bg-white text-slate-800 border border-white/90 font-bold text-xs sm:text-sm transition-all shadow-xs backdrop-blur-md hover:border-cyan-300"
              >
                <FileText className="w-4 h-4 text-cyan-600" />
                <span>Explore Sample CBC Report</span>
              </button>
            </div>

            {/* Micro Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>PDF, JPG & PNG Supported</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Max 10MB Validated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-cyan-600" />
                <span>Client-Side Privacy Demo</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Frosted Glass Showcase Widget */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm relative">
              {/* Decorative background glow behind widget */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/30 to-purple-400/30 rounded-3xl blur-2xl -z-10" />

              {/* Main Translucent Card */}
              <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/90 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Health Literacy Pulse</h4>
                      <p className="text-[10px] text-slate-500">Live Comprehension Index</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                </div>

                {/* Translucent Biomarker Mini Preview */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Hemoglobin (Hb)</p>
                      <p className="text-[10px] text-slate-500">Observed: 13.8 g/dL (Normal)</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Normal
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Fasting Blood Glucose</p>
                      <p className="text-[10px] text-slate-500">Observed: 108 mg/dL (Elevated)</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Elevated
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-cyan-50/70 border border-cyan-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">HDL "Good" Cholesterol</p>
                      <p className="text-[10px] text-slate-500">Observed: 54 mg/dL (Protective)</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                      Optimal
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => onSelectSample('report-cbc-glucose')}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-cyan-600/20"
                  >
                    View Interactive Sample Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Multi-Colored Translucent Diagnostic Panels */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50/80 px-3 py-1 rounded-full border border-cyan-200/70 mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Disciplinary Coverage</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Supported Diagnostic Panels
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select any medical domain below to inspect realistic sample laboratory interpretations
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Instant 1-Click Inspection
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {diagnosticPanels.map((panel, idx) => {
            const Icon = panel.icon;

            return (
              <div
                key={idx}
                onClick={() => onSelectSample(panel.id)}
                className={`rounded-3xl p-6 cursor-pointer transition-all duration-300 ${panel.containerClass} space-y-4 hover:-translate-y-1.5 hover:shadow-xl`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${panel.iconClass} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${panel.badgeClass}`}>
                    {panel.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className={`font-black text-base ${panel.textClass}`}>
                    {panel.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {panel.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-black">
                  <span className={panel.btnClass}>Try Sample</span>
                  <ChevronRight className={`w-4 h-4 ${panel.btnClass}`} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3-Step Plain Language Educational Workflow */}
      <section className="glass-card p-8 sm:p-12 space-y-8 border border-white/80">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-cyan-600 to-emerald-600">
            Intuitive Educational Journey
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How ReportSaathi Empowers Health Literacy
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            From clinical laboratory jargon to confident doctor conversations in 3 straightforward steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workflowSteps.map((step, idx) => (
            <div 
              key={idx} 
              className="p-6 rounded-3xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs space-y-3 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${step.color} text-white font-black text-sm flex items-center justify-center shadow-md`}>
                  {step.step}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${step.badgeClass}`}>
                  {step.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Educational Non-Diagnostic Disclaimer Box */}
      <section className="glass-amber rounded-3xl p-6 sm:p-8 border border-amber-300/80 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shrink-0 mt-0.5 shadow-md shadow-amber-500/20">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm text-amber-950">
            <h4 className="font-black text-sm sm:text-base text-amber-950">
              Important Educational Notice & Medical Disclaimer
            </h4>
            <p className="leading-relaxed text-amber-900/90 max-w-5xl">
              ReportSaathi is designed solely for educational health literacy. It does not provide medical advice, diagnosis, treatment, or clinical consultation. Laboratory reference intervals vary widely depending on specific lab methodologies, demographic factors, and patient medical histories. Always review your laboratory findings directly with a licensed physician.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
