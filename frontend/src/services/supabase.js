import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const DEMO_STORAGE_KEY = 'reportsaathi_demo_saved_reports';

export async function getCurrentUser() {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.warn("Supabase auth error:", err);
    return null;
  }
}

export async function signIn(email, password) {
  if (!supabase) throw new Error("Supabase is not configured yet. Running in demo mode.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signUp(email, password) {
  if (!supabase) throw new Error("Supabase is not configured yet. Running in demo mode.");
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Opt-in save report to Supabase or local demo storage.
 * Enforces privacy:
 * - Stores only structured parameters, summaries, and title.
 * - NEVER stores raw files or unredacted OCR documents.
 * - Never pretends data was saved to cloud if credentials are missing.
 */
export async function saveReportToHistory(report, user = null) {
  // Extract strictly sanitized parameters (no binary/base64, no raw OCR documents)
  const biomarkersPayload = (report.biomarkers || []).map(b => ({
    name: b.name,
    value: b.value,
    unit: b.unit,
    reference_range: b.referenceRange,
    status: b.status,
    explanation: b.explanation,
    clarity_note: b.clarityNote
  }));

  const payload = {
    report_title: report.title || "Laboratory Report",
    overall_status: report.overallStatus || "Reviewed",
    summary: report.summary || "",
    biomarkers_summary: biomarkersPayload,
    file_name: report.fileName || "report.pdf"
  };

  // If Supabase is configured and user is signed in, save to cloud
  if (supabase && user?.id) {
    try {
      const { data, error } = await supabase
        .from('report_history')
        .insert({
          ...payload,
          user_id: user.id
        })
        .select('id, created_at')
        .single();

      if (error) throw error;

      return {
        saved: true,
        reportId: data.id,
        isDemo: false,
        message: "Report successfully saved to your private Supabase database."
      };
    } catch (err) {
      console.error("Failed to save report to Supabase:", err);
      throw new Error(err.message || "Failed to save report to database.");
    }
  }

  // Graceful Demo Mode fallback: save in browser localStorage with clear notice
  const localRecord = {
    id: `demo-${Date.now()}`,
    ...payload,
    created_at: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || '[]');
    existing.unshift(localRecord);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(existing.slice(0, 30)));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }

  return {
    saved: true,
    reportId: localRecord.id,
    isDemo: true,
    message: "Demo Mode: Saved locally in your browser. Supabase credentials are not configured, so no cloud records were created."
  };
}

/**
 * Retrieve saved reports list from Supabase or local demo store.
 */
export async function fetchSavedReports(user = null) {
  if (supabase && user?.id) {
    try {
      const { data, error } = await supabase
        .from('report_history')
        .select('id, report_title, overall_status, summary, biomarkers_summary, file_name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { reports: data || [], isDemo: false };
    } catch (err) {
      console.error("Error fetching reports from Supabase:", err);
      throw err;
    }
  }

  // Demo fallback
  try {
    const stored = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || '[]');
    return { reports: stored, isDemo: true };
  } catch (e) {
    return { reports: [], isDemo: true };
  }
}

/**
 * Delete a report from Supabase or local demo store.
 */
export async function deleteSavedReport(reportId, user = null) {
  if (supabase && user?.id) {
    try {
      const { error } = await supabase
        .from('report_history')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      return { deleted: true, isDemo: false };
    } catch (err) {
      console.error("Error deleting from Supabase:", err);
      throw err;
    }
  }

  // Demo fallback
  try {
    const stored = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || '[]');
    const updated = stored.filter(r => r.id !== reportId);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updated));
    return { deleted: true, isDemo: true };
  } catch (e) {
    return { deleted: false, isDemo: true };
  }
}
