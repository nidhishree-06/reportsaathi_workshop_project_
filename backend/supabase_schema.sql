-- ==============================================================================
-- ReportSaathi Database Schema for Supabase
-- ==============================================================================
-- Designed with privacy-first principles:
-- 1. Strictly stores structured educational summaries, test names, and observed values.
-- 2. Never stores raw file uploads (PDF, JPG, PNG) or unredacted raw OCR documents.
-- 3. Row Level Security (RLS) guarantees signed-in users access only their own records.
-- ==============================================================================

-- 1. Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
-- Linked to Supabase Auth (auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Report History Table
-- Minimum schema needed for user report tracking
CREATE TABLE IF NOT EXISTS public.report_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    report_title TEXT NOT NULL,
    overall_status TEXT DEFAULT 'Reviewed',
    summary TEXT NOT NULL,
    -- biomarkers_summary stores structured educational parameters:
    -- [{ "name": "Hemoglobin", "value": "13.8", "unit": "g/dL", "reference_range": "12.0 - 15.5", "status": "normal", "explanation": "..." }]
    biomarkers_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
    file_name TEXT, -- Reference name only (e.g. "blood_test.pdf"); original document binary is NOT stored
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id for high-performance user queries
CREATE INDEX IF NOT EXISTS idx_report_history_user_id ON public.report_history(user_id);
CREATE INDEX IF NOT EXISTS idx_report_history_created_at ON public.report_history(created_at DESC);

-- ==============================================================================
-- 4. Enable Row Level Security (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. RLS Policies for Profiles
-- ==============================================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- ==============================================================================
-- 6. RLS Policies for Report History
-- ==============================================================================
DROP POLICY IF EXISTS "Users can view their own reports" ON public.report_history;
CREATE POLICY "Users can view their own reports"
    ON public.report_history
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reports" ON public.report_history;
CREATE POLICY "Users can insert their own reports"
    ON public.report_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reports" ON public.report_history;
CREATE POLICY "Users can delete their own reports"
    ON public.report_history
    FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 7. Automatic Profile Creation Trigger on Auth Signup
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
