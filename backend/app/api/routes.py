import os
import tempfile
import logging
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query

from app.schemas.report import (
    ReportAnalysisResponse,
    FileInfo,
    ExtractedBiomarker,
    ExtractionResponse,
    ReportExplanationResponse,
    ExplainRequest,
    SaveReportRequest,
    SaveReportResponse
)
from app.services.extractor import (
    validate_file_metadata,
    extract_text_from_pdf_path,
    extract_text_from_image_path,
    mask_sensitive_pii,
    default_tesseract_path
)
from app.services.gemini import (
    analyze_report_with_gemini,
    analyze_report_text
)
from app.services.supabase import (
    is_supabase_configured,
    save_report_to_supabase,
    get_user_report_history,
    delete_user_report,
    get_user_reports
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["reports"])


@router.get("/health")
@router.get("/api/health")
async def health_check():
    """Health check endpoint to verify backend service, OCR, and integrations status."""
    tesseract_ok = default_tesseract_path.exists() or bool(os.environ.get("TESSDATA_PREFIX"))
    gemini_key_present = bool(os.environ.get("GEMINI_API_KEY"))
    supabase_configured = is_supabase_configured()
    return {
        "status": "ok",
        "service": "ReportSaathi Backend API",
        "version": "1.0.0",
        "tesseract_available": tesseract_ok,
        "gemini_configured": gemini_key_present,
        "supabase_configured": supabase_configured,
        "max_upload_size_mb": 10
    }


@router.post("/api/reports/analyze", response_model=ReportAnalysisResponse)
async def analyze_report(file: UploadFile = File(...)):
    """
    Main ReportSaathi Endpoint:
    - Accepts PDF, JPG, or PNG upload.
    - Validates file type, format, and size (<= 10MB).
    - Uses safe temporary file handling with guaranteed cleanup.
    - Extracts text from digital PDFs, and applies Tesseract OCR for images or scanned PDFs.
    - Masks patient PII for privacy before LLM processing.
    - Sends sanitized text to Google Gemini API (or structured rule-based fallback).
    - Returns structured JSON containing source facts vs AI explanations.
    - CRITICAL: Never invents missing report values or reference ranges.
    """
    filename = file.filename or "uploaded_report"
    content_type = (file.content_type or "").lower()

    # Read uploaded content in memory to evaluate size
    try:
        file_bytes = await file.read()
    except Exception as e:
        logger.error(f"Error reading upload file stream: {e}")
        raise HTTPException(
            status_code=400,
            detail="Failed to read the uploaded file stream. Please try uploading again."
        )

    # 1. Validate file metadata (size, empty file, extension)
    ext = validate_file_metadata(filename, content_type, len(file_bytes))

    # 2. Safe temporary-file handling with guaranteed cleanup
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_file:
            tmp_path = Path(tmp_file.name)
            tmp_file.write(file_bytes)
            tmp_file.flush()

        # 3. Extract text from PDF or Image
        extracted_text = ""
        page_count = 1
        extraction_method = "ocr_image"

        if ext == ".pdf":
            extracted_text, page_count, extraction_method = extract_text_from_pdf_path(tmp_path)
        else:
            extracted_text = extract_text_from_image_path(tmp_path)
            page_count = 1
            extraction_method = "ocr_image"

        # 4. Handle empty OCR or unreadable extraction
        if not extracted_text or not extracted_text.strip():
            raise HTTPException(
                status_code=422,
                detail=(
                    "Could not extract readable text from the document. "
                    "The file may be blank, corrupted, or too blurry for OCR. "
                    "Please ensure the image or PDF is clear, legible, and well-lit."
                )
            )

        # 5. Mask sensitive PII for patient privacy
        sanitized_text = mask_sensitive_pii(extracted_text)

        # 6. Process with Gemini API (strictly validated against Pydantic schema)
        gemini_analysis = analyze_report_with_gemini(sanitized_text)

        # 7. Map analyzed tests to flattened biomarkers list for UI rendering
        biomarkers: List[ExtractedBiomarker] = []
        for t in gemini_analysis.tests:
            sf = t.source_fact
            ai = t.ai_explanation
            biomarkers.append(ExtractedBiomarker(
                name=sf.test_name,
                value=sf.extracted_value,
                unit=sf.unit,
                reference_range=sf.reference_range,  # Strictly preserved from source
                status=ai.status,
                category="Laboratory Findings",
                explanation=ai.simple_explanation,
                clarity_note=ai.clarity_note,
                is_source_verified=True
            ))

        file_info = FileInfo(
            filename=filename,
            file_type=content_type or ext,
            file_size_bytes=len(file_bytes),
            page_count=page_count,
            extraction_method=extraction_method
        )

        return ReportAnalysisResponse(
            processing_status="success",
            file_info=file_info,
            extracted_text=sanitized_text,
            character_count=len(sanitized_text),
            analysis=gemini_analysis,
            biomarkers=biomarkers,
            summary=gemini_analysis.patient_summary,
            overall_status=gemini_analysis.overall_status,
            is_unclear=gemini_analysis.is_unclear,
            unclear_advisory=gemini_analysis.unclear_advisory,
            doctor_questions=gemini_analysis.doctor_questions,
            glossary=gemini_analysis.glossary,
            disclaimer=gemini_analysis.disclaimer
        )

    except HTTPException:
        # Re-raise standard client HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing report {filename}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred while analyzing the report: {str(e)}"
        )
    finally:
        # Safe temporary file cleanup guaranteed
        if tmp_path and tmp_path.exists():
            try:
                tmp_path.unlink()
                logger.info(f"Temporary file {tmp_path} safely deleted.")
            except Exception as cleanup_err:
                logger.warning(f"Could not remove temporary file {tmp_path}: {cleanup_err}")


# ==============================================================================
# Supabase Report History Endpoints (Opt-in User Saving & Deletion)
# ==============================================================================

@router.post("/api/reports/save", response_model=SaveReportResponse)
async def save_report(payload: SaveReportRequest):
    """
    Opt-in endpoint to save a report to user's private history in Supabase.
    PRIVACY RULES:
    1. Only stores structured parameters, values, and explanations.
    2. Does NOT store uploaded physical files or raw unredacted OCR documents.
    3. If Supabase is not configured, returns demo mode notice without pretending data was saved.
    """
    return save_report_to_supabase(payload)


@router.get("/api/reports/history")
async def fetch_user_history(user_id: str = Query(..., description="User unique identifier")):
    """Retrieves saved reports for the authenticated user from Supabase."""
    return get_user_report_history(user_id)


@router.delete("/api/reports/{report_id}")
async def remove_report(
    report_id: str,
    user_id: str = Query(..., description="User unique identifier")
):
    """Deletes a saved report record from the user's history."""
    return delete_user_report(report_id, user_id)


# Legacy endpoints for compatibility
@router.post("/api/explain", response_model=ReportExplanationResponse)
async def explain_report(request: ExplainRequest):
    """Generates an educational medical explanation using Gemini if configured."""
    if not request.raw_text.strip():
        raise HTTPException(status_code=400, detail="No report text provided for analysis.")

    sanitized_text = mask_sensitive_pii(request.raw_text)
    explanation = analyze_report_text(sanitized_text)
    return explanation


@router.get("/api/history")
async def fetch_history_legacy(user_id: str = Query(..., description="Supabase user ID")):
    """Legacy route for history."""
    reports = get_user_reports(user_id)
    return {"reports": reports}
