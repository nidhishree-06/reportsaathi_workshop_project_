import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  AlertTriangle,
  Clipboard,
  FileCheck2,
  Loader2
} from 'lucide-react';

const SAMPLE_REPORTS = [
  {
    title: "Complete Blood Count & Glucose",
    desc: "Hemoglobin, WBC, Platelets, Fasting Blood Sugar, HbA1c",
    text: `METROPOLITAN DIAGNOSTIC LABORATORY
Patient Name: Jane Doe
Age: 38 | Sex: Female
Date of Collection: 12-Nov-2026

COMPLETE BLOOD COUNT (CBC)
Hemoglobin: 11.1 g/dL (Reference: 12.0 - 15.5 g/dL) [LOW]
White Blood Cells (WBC): 6,800 /uL (Reference: 4,500 - 11,000 /uL) [NORMAL]
Platelet Count: 260,000 /uL (Reference: 150,000 - 450,000 /uL) [NORMAL]
Red Blood Cell (RBC) Count: 4.1 mil/uL (Reference: 4.0 - 5.2 mil/uL) [NORMAL]

METABOLIC & GLYCEMIC PANEL
Fasting Blood Glucose: 118 mg/dL (Reference: 70 - 99 mg/dL) [ELEVATED]
HbA1c (Glycated Hemoglobin): 5.9 % (Reference: < 5.7 %) [ELEVATED]
Serum Creatinine: 0.9 mg/dL (Reference: 0.6 - 1.2 mg/dL) [NORMAL]`
  },
  {
    title: "Comprehensive Lipid & Liver Panel",
    desc: "Cholesterol, Triglycerides, HDL, LDL, ALT/SGPT, AST",
    text: `APEX HEALTHCARE DIAGNOSTICS
Patient Name: Robert Smith
Age: 52 | Sex: Male
Test Date: 10-Nov-2026

LIPID PROFILE
Total Cholesterol: 228 mg/dL (Reference: < 200 mg/dL) [ELEVATED]
Triglycerides: 185 mg/dL (Reference: < 150 mg/dL) [ELEVATED]
HDL (Good) Cholesterol: 38 mg/dL (Reference: > 40 mg/dL) [LOW]
LDL (Bad) Cholesterol: 146 mg/dL (Reference: < 100 mg/dL) [ELEVATED]

LIVER FUNCTION TESTS
ALT (SGPT): 42 U/L (Reference: 7 - 56 U/L) [NORMAL]
AST (SGOT): 35 U/L (Reference: 10 - 40 U/L) [NORMAL]
Total Bilirubin: 0.8 mg/dL (Reference: 0.2 - 1.2 mg/dL) [NORMAL]`
  }
];

export default function FileUpload({ onFileUpload, onTextSubmit, isLoading }) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [pastedText, setPastedText] = useState('');
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndSubmitFile = (file) => {
    setFileError('');
    if (!file) return;

    const validTypes = [
      'application/pdf', 
      'image/png', 
      'image/jpeg', 
      'image/jpg', 
      'image/webp'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpe?g|webp)$/i)) {
      setFileError('Please upload a valid PDF or Image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFileError('File size exceeds the 15MB limit. Please upload a smaller file.');
      return;
    }

    onFileUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSubmitFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSubmitFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = (e) => {
    e.preventDefault();
    if (!pastedText.trim()) {
      setFileError('Please paste some report text first.');
      return;
    }
    setFileError('');
    onTextSubmit(pastedText);
  };

  const handleLoadSample = (sample) => {
    setFileError('');
    onTextSubmit(sample.text);
  };

  return (
    <div className="space-y-6">
      {/* Upload Box Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1.5 text-sm font-medium">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-teal-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload PDF or Photo
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
              activeTab === 'paste'
                ? 'bg-white text-teal-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Clipboard className="w-4 h-4" />
            Paste Lab Text
          </button>
        </div>

        {/* Tab 1: Drag & Drop File Zone */}
        {activeTab === 'upload' && (
          <div className="p-6 sm:p-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-teal-500 bg-teal-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />

              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-semibold text-slate-800">
                    Drag and drop your lab report here
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Supports PDF, PNG, JPG, or phone camera snapshots (up to 15MB)
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition-colors shadow-sm">
                  <FileText className="w-4 h-4" />
                  Browse File
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Direct Text Paste */}
        {activeTab === 'paste' && (
          <form onSubmit={handlePasteSubmit} className="p-6 sm:p-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Paste raw text copied from your diagnostic portal:
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Example: Hemoglobin 11.2 g/dL (12-15), Glucose 125 mg/dL..."
                className="w-full rounded-2xl border border-slate-300 p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !pastedText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Explain Report
              </button>
            </div>
          </form>
        )}

        {/* Error notification */}
        {fileError && (
          <div className="mx-6 sm:mx-8 mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Processing Spinner Overlay */}
        {isLoading && (
          <div className="mx-6 sm:mx-8 mb-6 p-4 rounded-2xl bg-teal-50/80 border border-teal-200 text-teal-900 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-teal-600 animate-spin shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">Processing your lab report...</span>
              <p className="text-xs text-teal-700">
                Extracting biomarkers via OCR and synthesizing plain-language explanations.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick-Test Sample Reports */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          Don't have a report on hand? Try a sample:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_REPORTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadSample(sample)}
              disabled={isLoading}
              className="text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all text-sm group shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 group-hover:text-teal-700">
                  {sample.title}
                </span>
                <span className="text-xs text-teal-600 font-medium">Test &rarr;</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                {sample.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
