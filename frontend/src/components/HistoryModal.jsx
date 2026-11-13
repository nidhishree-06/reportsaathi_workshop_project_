import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  FileText, 
  ArrowRight, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Bookmark, 
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { fetchSavedReports, deleteSavedReport } from '../services/supabase';

export default function HistoryModal({ isOpen, onClose, onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadReports();
    }
  }, [isOpen]);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchSavedReports();
      setReports(res.reports || []);
      setIsDemo(Boolean(res.isDemo));
    } catch (err) {
      setError(err.message || "Failed to load saved reports.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e, reportId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this report from your history?")) {
      return;
    }

    setDeletingId(reportId);
    try {
      await deleteSavedReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      alert("Failed to delete report: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="glass-card bg-white/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-white/90 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-cyan-500/20">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-slate-900">Your Saved Lab Reports</h3>
                {isDemo && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isDemo 
                  ? "Saved locally in browser session (Supabase credentials not configured)" 
                  : "Private cloud database history protected with Row Level Security"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Retrieving your saved reports...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Could not load history</span>
              </div>
              <p>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && reports.length === 0 && (
            <div className="text-center py-16 space-y-3 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm sm:text-base">No Saved Reports Found</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  When analyzing a lab report, click "Save to My History" to securely preserve your plain-language breakdown.
                </p>
              </div>
            </div>
          )}

          {/* Report Items List */}
          {!isLoading && !error && reports.length > 0 && (
            <div className="space-y-2.5">
              {reports.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    // Convert history row into ResultsPage report format
                    const adapted = {
                      id: item.id,
                      title: item.report_title || "Laboratory Report",
                      fileName: item.file_name || "report.pdf",
                      fileType: "Saved History",
                      date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent",
                      lab: "Saved Record",
                      overallStatus: item.overall_status || "Reviewed",
                      summary: item.summary,
                      biomarkers: (item.biomarkers_summary || []).map(b => ({
                        name: b.name,
                        value: b.value || "Not Reported",
                        unit: b.unit || "",
                        referenceRange: b.reference_range || "Not specified on report",
                        status: b.status || "recorded",
                        category: "Laboratory Findings",
                        explanation: b.explanation,
                        clarityNote: b.clarity_note,
                        isSourceVerified: true
                      })),
                      doctorQuestions: [
                        {
                          topic: "Follow-up",
                          question: "How do these historical test values compare with my current readings?",
                          reason: "Comparing trends over time provides critical longitudinal health insights."
                        }
                      ],
                      glossary: []
                    };
                    onSelectReport(adapted);
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white/70 hover:bg-white hover:border-cyan-400 transition-all cursor-pointer group flex items-center justify-between gap-3 shadow-xs hover:shadow-md"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-cyan-700 truncate">
                        {item.report_title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                        {item.overall_status || "Reviewed"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                      <span>&bull;</span>
                      <span className="truncate">File: {item.file_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      disabled={deletingId === item.id}
                      title="Delete from history"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    <div className="p-2 rounded-xl text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Notice */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted with Row Level Security. No raw medical files stored.</span>
          </div>
          <button
            onClick={loadReports}
            className="text-cyan-700 font-bold hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
