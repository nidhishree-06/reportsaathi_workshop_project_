import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  HelpCircle, 
  Stethoscope, 
  BookOpen, 
  Calendar, 
  Building2, 
  Sparkles, 
  AlertTriangle,
  Info,
  Check,
  FileText,
  Bot,
  BookmarkPlus,
  Trash2,
  Loader2,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { saveReportToHistory, deleteSavedReport } from '../services/supabase';

export default function ResultsPage({ report, searchQuery = '', onReset, onSwitchSample }) {
  const [checkedQuestions, setCheckedQuestions] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Supabase Save & Delete State Handling
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { saved: boolean, message: string, isDemo: boolean, reportId: string }
  const [saveError, setSaveError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null);

  if (!report) return null;

  const toggleQuestion = (idx) => {
    setCheckedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleSaveReport = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const result = await saveReportToHistory(report);
      setSaveStatus(result);
    } catch (err) {
      setSaveError(err.message || "Failed to save report.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReport = async () => {
    const targetId = saveStatus?.reportId || report.id;
    if (!targetId) return;

    if (!window.confirm("Are you sure you want to delete this report from your history?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSavedReport(targetId);
      setDeleteStatus("Report removed from history successfully.");
      setSaveStatus(null);
    } catch (err) {
      alert("Failed to delete report: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = ['all', ...new Set((report.biomarkers || []).map(b => b.category))];

  // Filter biomarkers by category and search query
  const filteredBiomarkers = (report.biomarkers || []).filter(b => {
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'elevated' || s === 'high') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
          <ArrowUpCircle className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
          Elevated
        </span>
      );
    }
    if (s === 'low') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-900 border border-sky-300 shadow-xs">
          <ArrowDownCircle className="w-3.5 h-3.5 text-sky-600 stroke-[2.5]" />
          Low
        </span>
      );
    }
    if (s === 'normal') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
          Normal
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-300 shadow-xs">
        <HelpCircle className="w-3.5 h-3.5 text-purple-600 stroke-[2.5]" />
        Recorded
      </span>
    );
  };

  const getCategoryColor = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('hematology') || cat.includes('blood')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (cat.includes('glycemic') || cat.includes('glucose') || cat.includes('sugar')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (cat.includes('lipid') || cat.includes('cardio') || cat.includes('heart')) return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    if (cat.includes('thyroid') || cat.includes('endocrine')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-slate-800 bg-white/80 border border-white/90 hover:bg-white transition-all shadow-xs backdrop-blur-md hover:border-cyan-300"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-600 stroke-[2.5]" />
          <span>Upload Another Report</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {onSwitchSample && (
            <div className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-white/90 text-xs font-bold shadow-xs">
              <span className="px-2.5 text-slate-400 font-semibold">Test Sample:</span>
              <button
                onClick={() => onSwitchSample('report-cbc-glucose')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  report.id === 'report-cbc-glucose' 
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                CBC Panel
              </button>
              <button
                onClick={() => onSwitchSample('report-lipid')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  report.id === 'report-lipid' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Lipid Panel
              </button>
              <button
                onClick={() => onSwitchSample('report-thyroid')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  report.id === 'report-thyroid' 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Thyroid Panel
              </button>
            </div>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white transition-all shadow-md shadow-cyan-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Visible Educational-Use-Only Banner (Mandatory UI Requirement) */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-300/80 backdrop-blur-xl text-xs sm:text-sm flex flex-wrap items-center justify-between text-amber-950 gap-2">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Educational Use Only:</strong> ReportSaathi does not diagnose, prescribe treatment, or claim clinical certainty. Always consult a qualified clinician.
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-700 text-white text-[10px] font-black uppercase tracking-wider">
          Non-Diagnostic
        </span>
      </div>

      {/* Unclear Document Advisory (if report was incomplete or blurry) */}
      {report.isUnclear && (
        <div className="p-5 rounded-3xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 space-y-2 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2 font-black text-sm sm:text-base text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Document Clarity Notice & Clinician Consultation Advisory</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
            {report.unclearAdvisory || "The uploaded report text appears incomplete, sparse, or missing standard laboratory intervals. Because medical precision is essential, please verify this document with your qualified clinician."}
          </p>
        </div>
      )}

      {/* User Choice to Save Report (Opt-in Supabase Persistence) */}
      <div className="glass-card p-6 sm:p-7 border border-white/85 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white">
                <BookmarkPlus className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Save Report to My History
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Opt-In Only
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You choose whether to save this report. We practice strict privacy:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200 text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Stored:</strong> Title, date, biomarker values & explanations</span>
              </div>
              <div className="flex items-center gap-1.5 bg-rose-50/80 p-2 rounded-xl border border-rose-200 text-rose-950">
                <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                <span><strong>NEVER Stored:</strong> Original uploaded files or raw OCR scans</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            {!saveStatus?.saved ? (
              <button
                onClick={handleSaveReport}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Report...</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Save to My History</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Saved
                </span>
                <button
                  onClick={handleDeleteReport}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save Status / Feedback Feedback Notice */}
        {saveStatus && (
          <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 ${
            saveStatus.isDemo
              ? "bg-amber-50 text-amber-900 border border-amber-300"
              : "bg-emerald-50 text-emerald-900 border border-emerald-300"
          }`}>
            <span>{saveStatus.message}</span>
            {saveStatus.isDemo && (
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 shrink-0">
                Demo Storage
              </span>
            )}
          </div>
        )}

        {deleteStatus && (
          <div className="p-3.5 rounded-2xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            {deleteStatus}
          </div>
        )}

        {saveError && (
          <div className="p-3.5 rounded-2xl text-xs font-semibold bg-rose-50 text-rose-900 border border-rose-300">
            {saveError}
          </div>
        )}
      </div>

      {/* Overview Banner Card with Frosted Glassmorphism */}
      <div className="glass-card p-6 sm:p-8 space-y-4 border border-white/85">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/80 shadow-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-cyan-600" />
              {report.date}
            </span>
            <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/80 shadow-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              {report.lab}
            </span>
          </div>

          <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
            {report.overallStatus}
          </span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {report.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Source document: <span className="font-mono text-slate-700 bg-white/60 px-2 py-0.5 rounded-lg border border-slate-200">{report.fileName}</span> ({report.fileType})
          </p>
        </div>

        {/* Patient Friendly Executive Summary */}
        <div className="bg-white/75 backdrop-blur-lg rounded-2xl p-5 border border-white/90 shadow-xs space-y-1.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">
            Patient-Friendly Executive Summary
          </h3>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
            {report.summary}
          </p>
        </div>
      </div>

      {/* Extracted Values & Plain-Language Explanations */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Biomarkers & Plain Language Translations
            </h3>
            <p className="text-xs text-slate-500">
              Clearly distinguishing unmodified source-extracted laboratory facts from AI educational explanations
            </p>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div className="flex flex-wrap gap-1.5 text-xs font-bold bg-white/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 shadow-xs">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl capitalize transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Biomarker List Cards with Distinct Source Fact vs AI Explanation */}
        <div className="grid grid-cols-1 gap-4">
          {filteredBiomarkers.map((item, idx) => (
            <div 
              key={idx}
              className="glass-card p-5 sm:p-6 glass-card-hover space-y-4 border border-white/85"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    {item.name}
                  </h4>
                </div>

                <div>
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* Two Distinct Sections: 1. Source Extracted Facts & 2. AI Explanation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Zone A: Source Document Facts */}
                <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200/60">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <FileText className="w-3.5 h-3.5 text-cyan-600" />
                      Source Document Fact
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Unmodified
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 font-semibold">Observed Value:</span>
                      <strong className="text-slate-950 font-black text-sm sm:text-base">
                        {item.value} {item.unit}
                      </strong>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 font-semibold">Report Reference Range:</span>
                      <strong className={`text-xs ${item.referenceRange && !item.referenceRange.includes("Not specified") ? "text-slate-800 font-bold" : "text-amber-800 font-normal italic"}`}>
                        {item.referenceRange}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Zone B: AI Educational Plain-Language Translation */}
                <div className="lg:col-span-7 bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/90 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200/60">
                    <span className="flex items-center gap-1.5 text-indigo-700">
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      AI Educational Explanation
                    </span>
                    <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      Plain Language
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {item.explanation}
                  </p>

                  {/* Clarity note if information was missing or unclear */}
                  {item.clarityNote && (
                    <div className="flex items-start gap-1.5 pt-1 text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                      <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span><strong>Document Notice:</strong> {item.clarityNote}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Section: Doctor Questions Checklist & Glossary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Questions Checklist */}
        <div className="glass-card p-6 sm:p-7 space-y-4 border border-white/85">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
              <Stethoscope className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-base text-slate-900">
                Questions for Your Doctor
              </h4>
              <p className="text-xs text-slate-500">
                Check off questions you want to discuss during your consultation
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {report.doctorQuestions.map((q, idx) => (
              <div
                key={idx}
                onClick={() => toggleQuestion(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 backdrop-blur-md ${
                  checkedQuestions[idx]
                    ? 'bg-emerald-50/70 border-emerald-300 text-slate-500'
                    : 'bg-white/70 border-white/90 hover:border-cyan-400 hover:bg-white/90 shadow-xs'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                  checkedQuestions[idx]
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}>
                  {checkedQuestions[idx] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="space-y-1">
                  <p className={`text-sm font-bold ${checkedQuestions[idx] ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {q.question}
                  </p>
                  <p className="text-xs text-slate-500">
                    <strong className="text-cyan-800">Why this matters:</strong> {q.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Glossary */}
        <div className="glass-card p-6 sm:p-7 space-y-4 border border-white/85">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-base text-slate-900">
                Medical Terms Explained Simply
              </h4>
              <p className="text-xs text-slate-500">
                Clinical laboratory terms decoded for everyday health literacy
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {report.glossary.map((g, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 shadow-xs space-y-1 hover:border-purple-300 transition-all">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-sm text-slate-900">
                    {g.term}
                  </h5>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    Term
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {g.meaning}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prominent Non-Diagnostic Medical Disclaimer (Footer) */}
      <div className="glass-amber border border-amber-300/90 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shrink-0 mt-0.5 shadow-md shadow-amber-500/20">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm text-amber-950">
            <h4 className="font-black text-base text-amber-950">
              Important Educational Notice & Medical Disclaimer
            </h4>
            <p className="leading-relaxed text-amber-900/90">
              This summary is generated for educational comprehension purposes only and does NOT constitute medical advice, diagnosis, prognosis, or clinical treatment plans. Laboratory reference intervals vary between clinical facilities, test methodologies, patient age, and gender. Always consult a qualified medical professional or your primary healthcare provider regarding your test results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
