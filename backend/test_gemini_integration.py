"""
Automated unit tests for ReportSaathi Gemini integration & rule-based validation.
Tests synthetic sample reports:
1. Synthetic CBC Report (values & ranges provided)
2. Synthetic Lipid Panel with missing reference intervals (verifies NEVER invented)
3. Synthetic Unclear / Sparse Report (verifies is_unclear & clinician advisory)
"""
import sys
from pathlib import Path
from pydantic import ValidationError

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.services.gemini import (
    analyze_report_with_gemini,
    get_deterministic_analysis,
    GEMINI_MEDICAL_EXPLAINER_SYSTEM_PROMPT
)
from app.schemas.report import GeminiAnalysisResponse

def test_synthetic_cbc():
    print("--- Test 1: Synthetic CBC Report ---")
    cbc_text = """
    METROPOLIS DIAGNOSTIC SERVICES
    PATIENT NAME: John Doe    AGE: 34 Y / M    DATE: 12-Nov-2026
    COMPLETE BLOOD COUNT (CBC)
    TEST PARAMETER             RESULT     UNIT      REFERENCE RANGE
    Hemoglobin                 11.4       g/dL      13.0 - 17.0
    Total Leukocyte Count (WBC) 7800       cells/mcL 4000 - 11000
    Platelet Count             240        10^3/uL   150 - 450
    """

    res = analyze_report_with_gemini(cbc_text)
    assert isinstance(res, GeminiAnalysisResponse)
    assert len(res.tests) >= 3
    
    # Verify hemoglobin
    hb = next((t for t in res.tests if "hemoglobin" in t.source_fact.test_name.lower()), None)
    assert hb is not None
    assert hb.source_fact.extracted_value == "11.4"
    assert "13.0" in hb.source_fact.reference_range
    assert hb.ai_explanation.status == "low"
    assert "oxygen" in hb.ai_explanation.simple_explanation.lower()
    
    # Verify WBC
    wbc = next((t for t in res.tests if "wbc" in t.source_fact.test_name.lower() or "white" in t.source_fact.test_name.lower()), None)
    assert wbc is not None
    assert wbc.ai_explanation.status == "normal"

    assert "EDUCATIONAL USE ONLY" in res.disclaimer
    print("PASS: Synthetic CBC accurately parsed without hallucination.")

def test_synthetic_missing_ranges():
    print("\n--- Test 2: Synthetic Report with MISSING Reference Ranges ---")
    # This report intentionally provides NO reference ranges for cholesterol and triglycerides
    missing_range_text = """
    METROPOLIS LABS
    LIPID SCREENING
    Total Cholesterol: 215 mg/dL
    Triglycerides: 160 mg/dL
    Note: Reference ranges pending laboratory methodology update.
    """

    res = analyze_report_with_gemini(missing_range_text)
    assert isinstance(res, GeminiAnalysisResponse)
    
    chol = next((t for t in res.tests if "cholesterol" in t.source_fact.test_name.lower()), None)
    assert chol is not None
    assert chol.source_fact.extracted_value == "215"
    # CRITICAL: Must be None because report didn't state it! Never invented!
    assert chol.source_fact.reference_range is None
    assert chol.ai_explanation.clarity_note is not None
    print(f"Verified clarity note: {chol.ai_explanation.clarity_note}")
    print("PASS: Reference range was NOT invented when absent from report.")

def test_synthetic_unclear_report():
    print("\n--- Test 3: Synthetic Unclear / Sparse Report ---")
    unclear_text = """
    Scanned doc... [BLURRED] ... clinic report #912 ... [ILLEGIBLE]
    """

    res = analyze_report_with_gemini(unclear_text)
    assert isinstance(res, GeminiAnalysisResponse)
    assert res.is_unclear is True
    assert res.unclear_advisory is not None
    assert "clinician" in res.unclear_advisory.lower() or "healthcare" in res.unclear_advisory.lower()
    print(f"Verified unclear advisory: {res.unclear_advisory}")
    print("PASS: Unclear document correctly flagged with clinician advisory.")

if __name__ == "__main__":
    test_synthetic_cbc()
    test_synthetic_missing_ranges()
    test_synthetic_unclear_report()
    print("\nALL SYNTHETIC TESTS PASSED SUCCESSFULLY!")
