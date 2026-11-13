import logging
from typing import Optional, Dict, Any, List
from app.core.config import settings
from app.schemas.report import SaveReportRequest, SaveReportResponse

logger = logging.getLogger(__name__)

supabase_client = None

def is_supabase_configured() -> bool:
    """Checks whether valid Supabase credentials are configured in server environment."""
    url = (settings.SUPABASE_URL or "").strip()
    key = (settings.SUPABASE_KEY or "").strip()
    return bool(url and key and url.startswith("http"))

def get_supabase():
    """Initializes and caches the Supabase client if configured."""
    global supabase_client
    if supabase_client is not None:
        return supabase_client
    
    if is_supabase_configured():
        try:
            from supabase import create_client
            supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.info("Supabase client initialized successfully.")
            return supabase_client
        except Exception as e:
            logger.warning(f"Could not initialize Supabase client: {e}")
            return None
    return None

def save_report_to_supabase(data: SaveReportRequest) -> SaveReportResponse:
    """
    Saves structured report analysis to Supabase if configured.
    PRIVACY RULES ENFORCED:
    1. Stores only structured parameter names, values, units, ranges, and explanations.
    2. NEVER stores uploaded physical files (PDF/JPG/PNG) or raw unredacted OCR text.
    3. If credentials are absent, runs in demo mode without pretending data was saved.
    """
    if not is_supabase_configured():
        return SaveReportResponse(
            saved=False,
            is_demo=True,
            message="Demo Mode: Supabase credentials are not configured. Report was not saved to database."
        )

    client = get_supabase()
    if not client:
        return SaveReportResponse(
            saved=False,
            is_demo=True,
            message="Supabase client could not connect. Report was not saved."
        )

    try:
        # Prepare structured biomarkers summary (explicitly excluding raw documents)
        biomarkers_payload = [
            {
                "name": b.name,
                "value": b.value,
                "unit": b.unit,
                "reference_range": b.reference_range,
                "status": b.status,
                "explanation": b.explanation,
                "clarity_note": b.clarity_note
            }
            for b in data.biomarkers
        ]

        row = {
            "user_id": data.user_id,
            "report_title": data.report_title,
            "overall_status": data.overall_status,
            "summary": data.summary,
            "biomarkers_summary": biomarkers_payload,
            "file_name": data.file_name
        }

        res = client.table("report_history").insert(row).execute()
        report_id = None
        if res.data and len(res.data) > 0:
            report_id = str(res.data[0].get("id"))

        logger.info(f"Report '{data.report_title}' saved to Supabase (id={report_id}) for user={data.user_id}.")
        return SaveReportResponse(
            saved=True,
            report_id=report_id,
            is_demo=False,
            message="Report successfully saved to your private Supabase history."
        )

    except Exception as e:
        logger.error(f"Failed to save report to Supabase: {e}", exc_info=True)
        return SaveReportResponse(
            saved=False,
            is_demo=False,
            message=f"Failed to save report to database: {str(e)}"
        )

def get_user_report_history(user_id: str) -> Dict[str, Any]:
    """Retrieve saved reports for a user."""
    if not is_supabase_configured():
        return {
            "reports": [],
            "is_demo": True,
            "message": "Demo Mode: Supabase not configured."
        }

    client = get_supabase()
    if not client or not user_id:
        return {"reports": [], "is_demo": False}

    try:
        res = client.table("report_history")\
            .select("id, report_title, overall_status, summary, biomarkers_summary, file_name, created_at")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return {
            "reports": res.data or [],
            "is_demo": False
        }
    except Exception as e:
        logger.error(f"Failed to fetch reports from Supabase: {e}")
        return {"reports": [], "is_demo": False, "error": str(e)}

def delete_user_report(report_id: str, user_id: str) -> Dict[str, Any]:
    """Delete a report record for a user."""
    if not is_supabase_configured():
        return {
            "deleted": True,
            "is_demo": True,
            "message": "Demo Mode: Local report removed."
        }

    client = get_supabase()
    if not client or not report_id:
        return {"deleted": False, "is_demo": False, "message": "Client not available"}

    try:
        client.table("report_history")\
            .delete()\
            .eq("id", report_id)\
            .eq("user_id", user_id)\
            .execute()
        return {
            "deleted": True,
            "is_demo": False,
            "message": "Report deleted from database successfully."
        }
    except Exception as e:
        logger.error(f"Failed to delete report {report_id}: {e}")
        return {"deleted": False, "is_demo": False, "message": str(e)}

# Backward compatibility wrappers
def save_report_history(user_id: Optional[str], filename: str, report_data: Dict[str, Any]) -> bool:
    client = get_supabase()
    if not client or not user_id:
        return False
    try:
        client.table("report_history").insert({
            "user_id": user_id,
            "file_name": filename,
            "report_title": report_data.get("report_title", "Lab Report"),
            "summary": report_data.get("patient_friendly_summary", ""),
            "biomarkers_summary": report_data.get("categories", [])
        }).execute()
        return True
    except Exception:
        return False

def get_user_reports(user_id: str) -> List[Dict[str, Any]]:
    res = get_user_report_history(user_id)
    return res.get("reports", [])
