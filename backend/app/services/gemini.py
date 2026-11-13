import os
import re
import json
import logging
from typing import Dict, Any, Optional, List
from google import genai
from google.genai import types

from app.core.config import settings
from app.core.prompts import GEMINI_MEDICAL_EXPLAINER_SYSTEM_PROMPT
from app.schemas.report import (
    GeminiAnalysisResponse,
    AnalyzedBiomarker,
    SourceExtractedFact,
    AIExplanation,
    QuestionForDoctor,
    MedicalTerm,
    ReportExplanationResponse
)

logger = logging.getLogger(__name__)

# Standard educational dictionary (educational translations ONLY - values/ranges are NEVER invented)
BIOMARKER_DICTIONARY = {
    "hemoglobin": {
        "canonical": "Hemoglobin (Hb)",
        "explanation": "An iron-rich protein in red blood cells that transports oxygen from your lungs to your body's tissues."
    },
    "wbc": {
        "canonical": "White Blood Cell Count (WBC)",
        "explanation": "Essential immune cells that multiply in response to microbial infections, allergies, or physical stress."
    },
    "platelets": {
        "canonical": "Platelet Count",
        "explanation": "Cell fragments that clump together to form plugs and blood clots, halting bleeding from blood vessels."
    },
    "rbc": {
        "canonical": "Red Blood Cell Count (RBC)",
        "explanation": "Cells containing hemoglobin that circulate oxygen and remove carbon dioxide throughout the vascular system."
    },
    "glucose": {
        "canonical": "Fasting Blood Glucose",
        "explanation": "The amount of circulating sugar after an overnight fast, an indicator of immediate glucose metabolism."
    },
    "hba1c": {
        "canonical": "HbA1c (Glycated Hemoglobin)",
        "explanation": "A weighted percentage of hemoglobin bound to glucose, reflecting average blood sugar levels over the past 2 to 3 months."
    },
    "cholesterol": {
        "canonical": "Total Cholesterol",
        "explanation": "A composite measurement of blood lipids (fats) essential for building cell membranes and hormones."
    },
    "hdl": {
        "canonical": "HDL 'Good' Cholesterol",
        "explanation": "High-Density Lipoprotein sweeps excess fats away from arterial walls back to the liver for excretion."
    },
    "ldl": {
        "canonical": "LDL 'Bad' Cholesterol",
        "explanation": "Low-Density Lipoprotein that can accumulate within arterial linings if present in elevated quantities."
    },
    "triglycerides": {
        "canonical": "Triglycerides",
        "explanation": "A prevalent type of bodily fat that stores unused calories for future energy between meals."
    },
    "tsh": {
        "canonical": "TSH (Thyroid Stimulating Hormone)",
        "explanation": "A pituitary hormone that signals your thyroid gland how much metabolic hormone (T3/T4) to produce."
    },
    "creatinine": {
        "canonical": "Serum Creatinine",
        "explanation": "A natural waste product of muscle turnover cleared by the kidneys, used to evaluate filtration rate."
    },
    "urea": {
        "canonical": "Blood Urea Nitrogen (BUN)",
        "explanation": "A waste byproduct of dietary protein breakdown cleared by the kidneys, sensitive to hydration status."
    }
}


def get_deterministic_analysis(raw_text: str) -> GeminiAnalysisResponse:
    """
    Safe deterministic rule-based analysis used when GEMINI_API_KEY is not configured
    or during API fallback.
    STRICT RULES ENFORCED:
    1. Does not invent values, units, or reference ranges.
    2. If no reference range is on the paper, sets reference_range to None.
    3. Clearly flags missing or unclear items in clarity_note.
    4. If the report text is too sparse or unclear, sets is_unclear=True with clinician advisory.
    """
    tests: List[AnalyzedBiomarker] = []
    lines = raw_text.split("\n")

    biomarker_patterns = [
        (r"(?i)\b(hemo?globin|hb)\b", "hemoglobin"),
        (r"(?i)\b(total\s*leukocyte|wbc|white\s*blood\s*cells?|tlc)\b", "wbc"),
        (r"(?i)\b(platelets?|plt)\b", "platelets"),
        (r"(?i)\b(rbc|red\s*blood\s*cells?)\b", "rbc"),
        (r"(?i)\b(fasting\s*blood\s*(?:sugar|glucose)|fbs|fbg|fasting\s*glucose)\b", "glucose"),
        (r"(?i)\b(hba1c|glycated\s*hemo?globin)\b", "hba1c"),
        (r"(?i)\b(total\s*cholesterol)\b", "cholesterol"),
        (r"(?i)\b(hdl(?:\s*cholesterol)?)\b", "hdl"),
        (r"(?i)\b(ldl(?:\s*cholesterol)?)\b", "ldl"),
        (r"(?i)\b(triglycerides?|tg)\b", "triglycerides"),
        (r"(?i)\b(tsh|thyroid\s*stimulating\s*hormone)\b", "tsh"),
        (r"(?i)\b(creatinine|serum\s*creatinine)\b", "creatinine"),
        (r"(?i)\b(blood\s*urea(?:\s*nitrogen)?|bun)\b", "urea")
    ]

    detected_keys = set()

    for line_idx, line in enumerate(lines):
        clean_line = line.strip()
        if not clean_line:
            continue

        for pattern, key in biomarker_patterns:
            if key in detected_keys:
                continue

            match = re.search(pattern, clean_line)
            if match:
                meta = BIOMARKER_DICTIONARY.get(key, {})
                canonical_name = meta.get("canonical", key.capitalize())
                simple_explanation = meta.get("explanation", "Standard diagnostic laboratory biomarker.")

                after_match = clean_line[match.end():]
                
                # Check for explicit reference range on the same line or next line
                range_match = re.search(r"(\d+(?:\.\d+)?\s*(?:-|–|to)\s*\d+(?:\.\d+)?)", after_match)
                less_than_match = re.search(r"([<>]\s*\d+(?:\.\d+)?)", after_match)

                reference_range = None
                if range_match:
                    reference_range = range_match.group(1).replace("–", "-")
                elif less_than_match:
                    reference_range = less_than_match.group(1)
                elif line_idx + 1 < len(lines):
                    next_line = lines[line_idx + 1]
                    next_range = re.search(r"(\d+(?:\.\d+)?\s*(?:-|–|to)\s*\d+(?:\.\d+)?)", next_line)
                    if next_range:
                        reference_range = next_range.group(1).replace("–", "-")

                # Extract observed numerical value
                value = None
                if reference_range and range_match:
                    pre_range = after_match[:range_match.span()[0]]
                    pre_numbers = re.findall(r"(\d+(?:\.\d+)?)", pre_range)
                    if pre_numbers:
                        value = pre_numbers[0]
                    else:
                        cand = re.findall(r"(\d+(?:\.\d+)?)", after_match)
                        if cand:
                            value = cand[0]
                else:
                    cand = re.findall(r"(\d+(?:\.\d+)?)", after_match)
                    if cand:
                        value = cand[0]

                # Extract unit if explicitly printed on line
                unit_match = re.search(r"(g/dL|mg/dL|uIU/mL|mIU/L|%|cells/mcL|10\^3/uL|/cumm|mmol/L|pg/mL|ng/dL|fl)", after_match, re.IGNORECASE)
                unit = unit_match.group(1) if unit_match else None

                # Determine status and clarity notes
                status = "not_specified"
                clarity_note = None

                if reference_range is None:
                    clarity_note = "Reference interval was not specified on this report. Values vary between clinical laboratories."
                
                if value is None:
                    clarity_note = "Numerical value could not be clearly resolved from the document."

                if value and reference_range and "-" in reference_range:
                    try:
                        v = float(value)
                        low_b, high_b = [float(p.strip()) for p in reference_range.split("-")]
                        if v < low_b:
                            status = "low"
                        elif v > high_b:
                            status = "elevated"
                        else:
                            status = "normal"
                    except ValueError:
                        status = "not_specified"
                elif value and reference_range and "<" in reference_range:
                    try:
                        v = float(value)
                        cutoff = float(re.findall(r"\d+(?:\.\d+)?", reference_range)[0])
                        status = "normal" if v < cutoff else "elevated"
                    except Exception:
                        status = "not_specified"

                detected_keys.add(key)
                tests.append(AnalyzedBiomarker(
                    source_fact=SourceExtractedFact(
                        test_name=canonical_name,
                        extracted_value=value,
                        unit=unit,
                        reference_range=reference_range  # Strictly None if not in report!
                    ),
                    ai_explanation=AIExplanation(
                        simple_explanation=simple_explanation,
                        status=status,
                        clarity_note=clarity_note
                    )
                ))

    # Evaluate overall clarity
    is_unclear = False
    unclear_advisory = None

    if len(raw_text.strip()) < 50 or not tests:
        is_unclear = True
        unclear_advisory = (
            "The extracted report text appears sparse, incomplete, or contains unrecognized laboratory parameters. "
            "Because clinical accuracy is paramount, please verify this document with your qualified healthcare provider."
        )

    # Construct patient summary
    if tests:
        normal_ct = sum(1 for t in tests if t.ai_explanation.status == "normal")
        elevated_ct = sum(1 for t in tests if t.ai_explanation.status == "elevated")
        low_ct = sum(1 for t in tests if t.ai_explanation.status == "low")
        unspec_ct = sum(1 for t in tests if t.ai_explanation.status == "not_specified")

        parts = []
        if normal_ct: parts.append(f"{normal_ct} within printed reference limits")
        if elevated_ct: parts.append(f"{elevated_ct} above printed reference limits")
        if low_ct: parts.append(f"{low_ct} below printed reference limits")
        if unspec_ct: parts.append(f"{unspec_ct} without printed reference intervals")

        patient_summary = (
            f"We identified {len(tests)} diagnostic parameter(s) from your document ({', '.join(parts)}). "
            "Keep in mind that laboratory test results represent biological snapshots and can fluctuate based on "
            "hydration, sleep, recent meals, and individual physiology."
        )
        overall_status = "Parameters within printed reference intervals" if not (elevated_ct or low_ct) else "Some readings outside printed reference intervals"
    else:
        patient_summary = (
            "The document text was parsed, but no standard diagnostic biomarkers were recognized with certainty. "
            "Please ensure the report image or PDF is clear and complete."
        )
        overall_status = "Unresolved Document"

    doctor_questions = [
        QuestionForDoctor(
            topic="Overall Clinical Context",
            question="How do these specific lab numbers correlate with my medical history and symptoms?",
            reason="Individual health history and clinical context are crucial for meaningful medical interpretation."
        ),
        QuestionForDoctor(
            topic="Follow-up Timeline",
            question="Would you recommend repeating any of these tests in 3 to 6 months to establish a trend?",
            reason="Longitudinal trends over time are far more clinically informative than a single lab measurement."
        )
    ]

    glossary = [
        MedicalTerm(
            term="Reference Interval",
            meaning="The expected numerical range observed in 95% of healthy individuals tested with the same laboratory instrument."
        ),
        MedicalTerm(
            term="Biomarker",
            meaning="A biological measurement in blood or body fluid that acts as an indicator of body functions."
        )
    ]

    return GeminiAnalysisResponse(
        report_title="Laboratory Report Educational Summary",
        patient_summary=patient_summary,
        overall_status=overall_status,
        is_unclear=is_unclear,
        unclear_advisory=unclear_advisory,
        tests=tests,
        doctor_questions=doctor_questions,
        glossary=glossary,
        disclaimer="EDUCATIONAL USE ONLY: ReportSaathi does not diagnose, prescribe treatment, or claim clinical certainty. Always consult a qualified clinician."
    )


def analyze_report_with_gemini(raw_text: str) -> GeminiAnalysisResponse:
    """
    Main function to analyze extracted report text with Google Gemini API.
    1. Reads GEMINI_API_KEY from server-side environment variables.
    2. Sends prompt with strict JSON schema enforcing:
       - No diagnosis, treatment prescription, or claims of certainty.
       - No invented values, units, or reference ranges.
       - Clear separation between source facts and AI explanations.
       - Clarity notes and clinician advisories if text is unclear.
    3. Validates Gemini output using Pydantic GeminiAnalysisResponse.
    4. Safely falls back to deterministic analysis on error or missing API key.
    """
    # Read API key from server-side environment variable only
    api_key = (os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY or "").strip()

    if not api_key:
        logger.info("Server-side GEMINI_API_KEY not configured. Executing deterministic rule-based analysis.")
        return get_deterministic_analysis(raw_text)

    try:
        client = genai.Client(api_key=api_key)

        user_content = f"""Please analyze the following extracted laboratory report text according to your system instructions:

--- BEGIN EXTRACTED REPORT TEXT ---
{raw_text}
--- END EXTRACTED REPORT TEXT ---
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_content,
            config=types.GenerateContentConfig(
                system_instruction=GEMINI_MEDICAL_EXPLAINER_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=GeminiAnalysisResponse,
                temperature=0.1
            )
        )

        response_text = (response.text or "").strip()
        if not response_text:
            logger.warning("Empty response from Gemini. Falling back to deterministic analysis.")
            return get_deterministic_analysis(raw_text)

        # Validate structured output against Pydantic schema
        parsed_data = GeminiAnalysisResponse.model_validate_json(response_text)

        # Mandatory safety checks on validated model
        if not parsed_data.disclaimer:
            parsed_data.disclaimer = (
                "EDUCATIONAL USE ONLY: ReportSaathi does not diagnose, prescribe treatment, or claim clinical certainty. Always consult a qualified clinician."
            )

        logger.info(f"Successfully analyzed report with Gemini: {len(parsed_data.tests)} tests identified.")
        return parsed_data

    except Exception as e:
        logger.error(f"Gemini API call or validation failed: {str(e)}", exc_info=True)
        fallback = get_deterministic_analysis(raw_text)
        fallback.overall_status = "Reviewed (Deterministic Mode)"
        return fallback


# Legacy wrapper function for backward compatibility
def analyze_report_text(raw_text: str) -> ReportExplanationResponse:
    gemini_resp = analyze_report_with_gemini(raw_text)
    
    # Map to legacy ReportExplanationResponse
    from app.schemas.report import ReportCategory, TestParameter
    legacy_params = []
    for t in gemini_resp.tests:
        sf = t.source_fact
        ai = t.ai_explanation
        legacy_params.append(TestParameter(
            name=sf.test_name,
            value=sf.extracted_value or "N/A",
            unit=sf.unit,
            reference_range=sf.reference_range,
            status=ai.status,
            summary=f"{ai.simple_explanation} {f'Note: {ai.clarity_note}' if ai.clarity_note else ''}".strip()
        ))

    return ReportExplanationResponse(
        report_title=gemini_resp.report_title,
        patient_friendly_summary=gemini_resp.patient_summary,
        overall_status=gemini_resp.overall_status,
        categories=[ReportCategory(category_name="Laboratory Biomarkers", parameters=legacy_params)],
        actionable_questions=gemini_resp.doctor_questions,
        glossary=gemini_resp.glossary,
        disclaimer=gemini_resp.disclaimer
    )
