import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  HelpCircle, 
  Stethoscope, 
  BookOpen, 
  Leaf, 
  Printer, 
  RotateCcw,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

export default function ReportViewer({ 
  explanation, 
  extraction, 
  onReset 
}) {
  const [showRawText, setShowRawText] = useState(false);
  const [checkedQuestions, setCheckedQuestions] = useState({});

  if (!explanation) return null;

  const toggleQuestion = (idx) => {
    setCheckedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'elevated' || s === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <ArrowUpCircle className="w-3.5 h-3.5" />
          Elevated
        </span>
      );
    }
    if (s === 'low') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <ArrowDownCircle className="w-3.5 h-3.5" />
          Low
        </span>
      );
    }
    if (s === 'normal') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Normal
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <HelpCircle className="w-3.5 h-3.5" />
        {status || 'Recorded'}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Bar Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          Analyze Another Report
        </button>

        <div className="flex items-center gap-2">
          {extraction && (
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
            >
              {showRawText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showRawText ? 'Hide Raw Text' : 'View Extracted Text'}</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {/* Raw Extracted Text Drawer / Accordion */}
      {showRawText && extraction && (
        <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 shadow-lg border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Extracted via {extraction.extraction_method?.toUpperCase()}</span>
              <span>&bull;</span>
              <span>{extraction.character_count} characters</span>
            </div>
            <span className="text-teal-400">Patient PII Auto-Masked</span>
          </div>
          <pre className="text-xs font-mono max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-300">
            {extraction.extracted_text}
          </pre>
        </div>
      )}

      {/* Overview Banner Card */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-teal-200 bg-teal-800/60 px-3 py-1 rounded-full border border-teal-700/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              Simplified Lab Overview
            </span>
            {explanation.overall_status && (
              <span className="text-xs font-medium bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-teal-100">
                {explanation.overall_status}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {explanation.report_title || "Laboratory Test Analysis"}
          </h2>

          <p className="text-sm sm:text-base text-teal-50/90 leading-relaxed max-w-4xl">
            {explanation.patient_friendly_summary}
          </p>
        </div>
      </div>

      {/* Biomarker Categories & Parameters Grid */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Test Biomarkers Explained</span>
        </h3>

        {explanation.categories && explanation.categories.map((category, catIdx) => (
          <div key={catIdx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100">
              <h4 className="font-semibold text-base text-slate-800">
                {category.category_name}
              </h4>
            </div>

            <div className="divide-y divide-slate-100">
              {category.parameters && category.parameters.map((param, paramIdx) => (
                <div key={paramIdx} className="p-6 hover:bg-slate-50/40 transition-colors space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-slate-900 text-base">
                        {param.name}
                      </h5>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>Reported: <strong className="text-slate-800">{param.value} {param.unit || ''}</strong></span>
                        {param.reference_range && (
                          <>
                            <span>&bull;</span>
                            <span>Standard Reference: {param.reference_range}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(param.status)}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-sm text-slate-700 leading-relaxed">
                    <span className="font-semibold text-teal-800 mr-1.5">What this means:</span>
                    {param.summary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column Section: Doctor Questions & Medical Glossary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questions for Doctor */}
        {explanation.actionable_questions && explanation.actionable_questions.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  Questions to Ask Your Doctor
                </h4>
                <p className="text-xs text-slate-500">
                  Check off items you wish to discuss during your appointment
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {explanation.actionable_questions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleQuestion(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                    checkedQuestions[idx]
                      ? 'bg-teal-50/50 border-teal-200 text-slate-600'
                      : 'bg-white border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checkedQuestions[idx])}
                    onChange={() => {}}
                    className="mt-1 rounded text-teal-600 focus:ring-teal-500 h-4 w-4 border-slate-300"
                  />
                  <div className="space-y-1">
                    <p className={`text-sm font-semibold ${checkedQuestions[idx] ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {item.question}
                    </p>
                    <p className="text-xs text-slate-500">
                      <strong>Why ask:</strong> {item.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical Terms Glossary */}
        {explanation.glossary && explanation.glossary.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  Plain-Language Glossary
                </h4>
                <p className="text-xs text-slate-500">
                  Translating complex medical abbreviations into everyday analogies
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {explanation.glossary.map((termItem, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="font-bold text-sm text-indigo-900">
                    {termItem.term}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {termItem.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lifestyle & Nutrition Points */}
      {explanation.lifestyle_diet_notes && explanation.lifestyle_diet_notes.length > 0 && (
        <div className="bg-emerald-50/50 rounded-3xl border border-emerald-100 p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <span>General Lifestyle & Nutrition Topics to Explore with Your Clinician</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-sm text-emerald-800">
            {explanation.lifestyle_diet_notes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white/70 p-3 rounded-xl border border-emerald-200/50">
                <span className="text-emerald-500 font-bold">&bull;</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mandatory Disclaimer Footer Box */}
      <div className="bg-slate-100 rounded-2xl p-4 text-xs text-slate-600 border border-slate-200 text-center leading-relaxed">
        <strong>Medical Disclaimer:</strong> {explanation.disclaimer}
      </div>
    </div>
  );
}
