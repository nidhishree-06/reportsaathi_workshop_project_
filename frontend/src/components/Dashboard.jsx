import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Shield, 
  ArrowRight, 
  Clock, 
  FileCheck2, 
  AlertTriangle,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import { MOCK_REPORTS } from '../data/mockReports';
import { analyzeReportFile } from '../services/api';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import ResultsPage from './ResultsPage';

export default function Dashboard({ 
  initialSampleId = null, 
  initialCustomReport = null,
  searchQuery = '',
  viewState,
  setViewState 
}) {
  const [activeReport, setActiveReport] = useState(() => {
    if (initialCustomReport) return initialCustomReport;
    if (initialSampleId) {
      return MOCK_REPORTS.find(r => r.id === initialSampleId) || MOCK_REPORTS[0];
    }
    return null;
  });

  useEffect(() => {
    if (initialCustomReport) {
      setActiveReport(initialCustomReport);
    }
  }, [initialCustomReport]);
  const [processingFileName, setProcessingFileName] = useState('');
  const [currentError, setCurrentError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Validate File (Type and Size)
  const validateFile = (file) => {
    const MAX_SIZE_MB = 10;
    const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;

    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const fileName = file.name.toLowerCase();
    const isExtensionValid = fileName.endsWith('.pdf') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');
    const isMimeValid = allowedMimeTypes.includes(file.type);

    if (!isMimeValid && !isExtensionValid) {
      return {
        valid: false,
        error: {
          title: "Unsupported File Format",
          message: `The file "${file.name}" is not supported.`,
          details: "ReportSaathi accepts PDF documents and image files (JPG, PNG) only. Please convert your report and try again."
        }
      };
    }

    if (file.size > MAX_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: {
          title: "File Exceeds Size Limit",
          message: `The file is ${sizeMB} MB, which exceeds the 10 MB limit.`,
          details: "Please compress your PDF or upload a lower-resolution photo to proceed."
        }
      };
    }

    return { valid: true };
  };

  // Real backend integration: calls FastAPI POST /api/reports/analyze
  const handleFileProcess = async (file) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setCurrentError(validation.error);
      setViewState('error');
      return;
    }

    setProcessingFileName(file.name);
    setViewState('loading');

    try {
      // Connect to FastAPI backend endpoint
      const apiResponse = await analyzeReportFile(file);

      // Adapt structured Gemini / Backend response into UI format
      const adaptedReport = {
        id: `report-${Date.now()}`,
        title: apiResponse.analysis?.report_title || apiResponse.summary || "Laboratory Report Analysis",
        fileName: apiResponse.file_info?.filename || file.name,
        fileType: apiResponse.file_info?.file_type || file.type || "Document",
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        lab: "Extracted Clinical Document",
        overallStatus: apiResponse.overall_status || "Reviewed",
        summary: apiResponse.summary || apiResponse.analysis?.patient_summary,
        isUnclear: Boolean(apiResponse.is_unclear),
        unclearAdvisory: apiResponse.unclear_advisory,
        disclaimer: apiResponse.disclaimer,
        rawExtractedText: apiResponse.extracted_text,
        biomarkers: (apiResponse.biomarkers || []).map(b => ({
          name: b.name,
          value: b.value || "Not Reported",
          unit: b.unit || "",
          referenceRange: b.reference_range || "Not specified on report",
          status: b.status || "recorded",
          category: b.category || "Laboratory Findings",
          explanation: b.explanation,
          clarityNote: b.clarity_note,
          isSourceVerified: Boolean(b.is_source_verified)
        })),
        doctorQuestions: apiResponse.doctor_questions || [],
        glossary: apiResponse.glossary || []
      };

      setActiveReport(adaptedReport);
      setViewState('results');
    } catch (err) {
      console.warn("Backend analysis API call error:", err);
      const detail = err.response?.data?.detail || err.message || "Failed to analyze document.";
      
      setCurrentError({
        title: "Report Processing Notice",
        message: detail,
        details: "Ensure the backend server is running on http://localhost:8000 and the uploaded file is a valid PDF, JPG, or PNG."
      });
      setViewState('error');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const loadSampleReport = (sampleId) => {
    const sample = MOCK_REPORTS.find(r => r.id === sampleId) || MOCK_REPORTS[0];
    setProcessingFileName(sample.fileName);
    setViewState('loading');
    setTimeout(() => {
      setActiveReport(sample);
      setViewState('results');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* State 1: Loading State */}
      {viewState === 'loading' && (
        <LoadingState fileName={processingFileName} />
      )}

      {/* State 2: Error State */}
      {viewState === 'error' && (
        <ErrorState
          error={currentError}
          onRetry={() => {
            setCurrentError(null);
            setViewState('idle');
          }}
          onReset={() => {
            setCurrentError(null);
            setViewState('idle');
          }}
        />
      )}

      {/* State 3: Empty State */}
      {viewState === 'empty' && (
        <EmptyState
          onUploadClick={() => setViewState('idle')}
          onSampleClick={() => loadSampleReport('report-cbc-glucose')}
        />
      )}

      {/* State 4: Results Page (Success State) */}
      {viewState === 'results' && activeReport && (
        <ResultsPage
          report={activeReport}
          searchQuery={searchQuery}
          onReset={() => {
            setActiveReport(null);
            setViewState('idle');
          }}
          onSwitchSample={(sampleId) => loadSampleReport(sampleId)}
        />
      )}

      {/* State 5: Default Idle State (Upload Area & Dashboard Cards) */}
      {viewState === 'idle' && (
        <div className="space-y-6">
          {/* Greeting Banner with Translucent Gradient */}
          <div className="glass-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 border border-white/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-700 bg-cyan-100/80 px-2.5 py-0.5 rounded-full border border-cyan-200">
                  Diagnostic Center
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-ping" />
                <span className="text-xs font-semibold text-slate-500">Live Gemini & OCR Backend</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
                <span>Medical Laboratory Workspace</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                Upload your laboratory results below to receive an educational, plain-language translation with biomarker reference ranges.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <div className="glass-emerald px-4 py-2 rounded-2xl text-emerald-800 flex items-center gap-2 shadow-xs">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Zero Patient Data Transmitted</span>
              </div>
            </div>
          </div>

          {/* Main Upload Dropzone Container with Frosted Glassmorphism */}
          <div className="glass-card p-6 sm:p-10 space-y-6 border border-white/85">
            <div className="max-w-xl mx-auto text-center space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Upload Your Medical Laboratory Report
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Supports PDF reports and photo captures (JPG, PNG). Maximum file size 10MB.
              </p>
            </div>

            {/* Drag & Drop Visual Box */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(e.currentTarget ? true : false); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? 'border-cyan-500 bg-cyan-50/70 scale-[0.99] shadow-lg shadow-cyan-500/20'
                  : 'border-slate-300/80 bg-white/50 backdrop-blur-xl hover:border-cyan-400 hover:bg-white/80 hover:shadow-md'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/25 hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-black text-slate-900">
                    Click to browse or drag and drop file here
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Accepts <strong className="text-slate-800">PDF, JPG, or PNG</strong> up to <strong className="text-slate-800">10MB</strong>
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm transition-all shadow-md shadow-cyan-600/25">
                  <FileText className="w-4 h-4" />
                  Select File From Computer
                </div>
              </div>
            </div>

            {/* Validation Notice Badges with Distinct Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2.5 glass-rose p-3.5 rounded-2xl text-rose-900 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Format: PDF, JPG, PNG only</span>
              </div>
              <div className="flex items-center gap-2.5 glass-cyan p-3.5 rounded-2xl text-cyan-900 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>Size limit: &le; 10MB verified</span>
              </div>
              <div className="flex items-center gap-2.5 glass-emerald p-3.5 rounded-2xl text-emerald-900 font-semibold">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Private client demo simulation</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Selector with 3 Distinct Color Themes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Or Test with Realistic Diagnostic Reports:
                </h3>
                <p className="text-xs text-slate-500">
                  Instant 1-click exploration with standard biomarkers and everyday explanations
                </p>
              </div>
              <span className="text-xs font-bold text-cyan-800 bg-cyan-100/90 px-3 py-1 rounded-full border border-cyan-200">
                1-Click Demo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MOCK_REPORTS.map((sample, idx) => {
                const sampleCards = [
                  { 
                    theme: 'glass-rose border-rose-300/80 hover:border-rose-400', 
                    pillClass: 'bg-rose-100 text-rose-800 border-rose-200', 
                    titleClass: 'text-rose-950', 
                    icon: FileSpreadsheet,
                    accent: 'text-rose-600'
                  },
                  { 
                    theme: 'glass-cyan border-cyan-300/80 hover:border-cyan-400', 
                    pillClass: 'bg-cyan-100 text-cyan-800 border-cyan-200', 
                    titleClass: 'text-cyan-950', 
                    icon: ImageIcon,
                    accent: 'text-cyan-600'
                  },
                  { 
                    theme: 'glass-purple border-purple-300/80 hover:border-purple-400', 
                    pillClass: 'bg-purple-100 text-purple-800 border-purple-200', 
                    titleClass: 'text-purple-950', 
                    icon: FileText,
                    accent: 'text-purple-600'
                  }
                ];
                const cardStyle = sampleCards[idx % sampleCards.length];
                const CardIcon = cardStyle.icon;

                return (
                  <button
                    key={sample.id}
                    onClick={() => loadSampleReport(sample.id)}
                    className={`rounded-3xl p-5 transition-all text-left space-y-2.5 group hover:-translate-y-1 hover:shadow-lg ${cardStyle.theme}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CardIcon className={`w-3.5 h-3.5 ${cardStyle.accent}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cardStyle.pillClass}`}>
                          {sample.fileType}
                        </span>
                      </div>
                      <ArrowRight className={`w-4 h-4 text-slate-400 group-hover:${cardStyle.accent} group-hover:translate-x-1 transition-all`} />
                    </div>
                    <h4 className={`font-black text-sm sm:text-base ${cardStyle.titleClass}`}>
                      {sample.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {sample.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
