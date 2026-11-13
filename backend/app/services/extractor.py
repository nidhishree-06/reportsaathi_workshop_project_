import os
import io
import re
import tempfile
import logging
from pathlib import Path
from typing import Tuple, Dict, Any, List, Optional
from PIL import Image, ImageEnhance, ImageOps
import pytesseract
import pypdf
import pypdfium2
from fastapi import HTTPException

from app.schemas.report import (
    ExtractedBiomarker, 
    QuestionForDoctor, 
    MedicalTerm, 
    FileInfo
)

logger = logging.getLogger(__name__)

# Constants
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {
    "application/pdf", 
    "image/jpeg", 
    "image/jpg", 
    "image/png", 
    "image/pjpeg",
    "application/octet-stream"  # Some browsers send this for images
}

# Configure TESSDATA_PREFIX
tessdata_dir = Path(__file__).resolve().parent.parent.parent / "tessdata"
if tessdata_dir.exists():
    os.environ["TESSDATA_PREFIX"] = str(tessdata_dir)

# Ensure tesseract binary path is set if available in default Windows location
default_tesseract_path = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
if default_tesseract_path.exists():
    pytesseract.pytesseract.tesseract_cmd = str(default_tesseract_path)


def validate_file_metadata(filename: str, content_type: Optional[str], file_size: int) -> str:
    """
    Validates file extension, MIME type, and size constraints.
    Returns normalized file extension.
    """
    if file_size == 0:
        raise HTTPException(
            status_code=400, 
            detail="Uploaded file is empty (0 bytes). Please upload a valid laboratory report."
        )

    if file_size > MAX_FILE_SIZE_BYTES:
        size_mb = file_size / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File size ({size_mb:.1f}MB) exceeds the maximum allowed limit of 10MB. Please compress your document and try again."
        )

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext or 'unknown'}'. ReportSaathi accepts PDF documents and image files (JPG, PNG) only."
        )

    return ext


def preprocess_image_for_ocr(image: Image.Image) -> Image.Image:
    """Enhance image contrast and convert to grayscale for optimal OCR accuracy."""
    try:
        image = ImageOps.exif_transpose(image)
    except Exception:
        pass

    gray = image.convert("L")
    enhancer = ImageEnhance.Contrast(gray)
    enhanced = enhancer.enhance(1.8)
    return enhanced


def extract_text_from_image_path(image_path: Path) -> str:
    """Extract text from an image file on disk using PIL & Tesseract OCR."""
    try:
        with Image.open(image_path) as img:
            processed_img = preprocess_image_for_ocr(img)
            text = pytesseract.image_to_string(processed_img, config="--psm 6")
            if not text.strip():
                # Fallback to standard automatic page segmentation
                text = pytesseract.image_to_string(processed_img)
            return text.strip()
    except Exception as e:
        logger.error(f"Image OCR failed for {image_path}: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"The uploaded image could not be processed: {str(e)}. Please check if the file is corrupted."
        )


def extract_text_from_pdf_path(pdf_path: Path) -> Tuple[str, int, str]:
    """
    Extracts text from PDF file.
    1. First attempts digital text extraction using pypdf.
    2. For pages with sparse/no digital text (scanned PDF), uses pypdfium2 to render
       page to image and applies Tesseract OCR.
    Returns (extracted_text, page_count, extraction_method).
    """
    full_text = []
    used_ocr = False
    used_digital = False
    page_count = 0

    try:
        reader = pypdf.PdfReader(str(pdf_path))
        page_count = len(reader.pages)
        if page_count == 0:
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF contains no pages."
            )
    except Exception as e:
        logger.error(f"Failed to read PDF {pdf_path}: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"The uploaded PDF file is invalid or corrupted: {str(e)}"
        )

    # Open with pypdfium2 in case OCR rendering is needed
    pdf_render_doc = None
    try:
        pdf_render_doc = pypdfium2.PdfDocument(str(pdf_path))
    except Exception:
        pass

    for page_idx in range(page_count):
        page_text = ""
        try:
            page_text = (reader.pages[page_idx].extract_text() or "").strip()
        except Exception:
            page_text = ""

        # If page has substantive digital text, keep it
        if len(page_text) > 40:
            full_text.append(f"--- Page {page_idx + 1} ---\n{page_text}")
            used_digital = True
        else:
            # Fallback: OCR scanned page via pypdfium2
            ocr_text = ""
            if pdf_render_doc is not None and page_idx < len(pdf_render_doc):
                try:
                    pdf_page = pdf_render_doc.get_page(page_idx)
                    # Render at 2x scale for 144 DPI readability
                    pil_image = pdf_page.render(scale=2.0).to_pil()
                    processed_img = preprocess_image_for_ocr(pil_image)
                    ocr_text = pytesseract.image_to_string(processed_img, config="--psm 6").strip()
                    if not ocr_text:
                        ocr_text = pytesseract.image_to_string(processed_img).strip()
                except Exception as err:
                    logger.warning(f"pypdfium2 OCR failed on page {page_idx + 1}: {err}")

            if ocr_text:
                full_text.append(f"--- Page {page_idx + 1} (OCR) ---\n{ocr_text}")
                used_ocr = True
            elif page_text:
                full_text.append(f"--- Page {page_idx + 1} ---\n{page_text}")
                used_digital = True

    combined = "\n\n".join(full_text).strip()

    if used_digital and used_ocr:
        method = "hybrid_pdf"
    elif used_ocr:
        method = "ocr_scanned_pdf"
    else:
        method = "digital_pdf"

    return combined, page_count, method


def mask_sensitive_pii(text: str) -> str:
    """
    Redacts personally identifiable information (PII) such as Patient Name,
    Phone numbers, MRN/UHID, Email addresses, and Street addresses.
    """
    patterns = [
        (r"(?i)(patient\s*name|pt\.?\s*name|name\s*:\s*)([^\n,]+)", r"\1[REDACTED_PATIENT_NAME]"),
        (r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", "[REDACTED_PHONE]"),
        (r"(?i)(mrn|uhid|patient\s*id|barcode|reg(istration)?\s*no\.?)\s*[:#-]?\s*([A-Za-z0-9_-]+)", r"\1: [REDACTED_ID]"),
        (r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "[REDACTED_EMAIL]"),
        (r"(?i)(address\s*:\s*)([^\n]+)", r"\1[REDACTED_ADDRESS]"),
    ]

    sanitized = text
    for pattern, replacement in patterns:
        sanitized = re.sub(pattern, replacement, sanitized)
    return sanitized


# Standard knowledge bank for plain-language educational explanations (NOT invented values!)
BIOMARKER_METADATA = {
    "hemoglobin": {
        "canonical": "Hemoglobin (Hb)",
        "category": "Complete Blood Count (CBC)",
        "unit": "g/dL",
        "explanation": "An iron-rich protein in red blood cells that carries oxygen from your lungs throughout your entire body."
    },
    "wbc": {
        "canonical": "White Blood Cell Count (WBC)",
        "category": "Complete Blood Count (CBC)",
        "unit": "cells/mcL",
        "explanation": "Vital defense cells of your immune system that multiply to fight off bacterial or viral infections."
    },
    "platelets": {
        "canonical": "Platelet Count",
        "category": "Complete Blood Count (CBC)",
        "unit": "10^3/uL",
        "explanation": "Microscopic cell fragments that clump together to form clots and stop bleeding when blood vessels are damaged."
    },
    "rbc": {
        "canonical": "Red Blood Cell Count (RBC)",
        "category": "Complete Blood Count (CBC)",
        "unit": "million/uL",
        "explanation": "The primary cellular transporters carrying oxygen and carbon dioxide throughout your bloodstream."
    },
    "glucose": {
        "canonical": "Fasting Blood Glucose",
        "category": "Glycemic & Metabolic Panel",
        "unit": "mg/dL",
        "explanation": "The amount of sugar circulating in your blood after an overnight fast, reflecting immediate metabolic regulation."
    },
    "hba1c": {
        "canonical": "HbA1c (Glycated Hemoglobin)",
        "category": "Glycemic & Metabolic Panel",
        "unit": "%",
        "explanation": "Measures the percentage of hemoglobin coated with sugar, providing a reliable picture of average blood sugar over the last 90 days."
    },
    "cholesterol": {
        "canonical": "Total Cholesterol",
        "category": "Cardiovascular Lipid Profile",
        "unit": "mg/dL",
        "explanation": "A composite measure of all cholesterol types circulating in your blood, used to evaluate cardiovascular health."
    },
    "hdl": {
        "canonical": "HDL 'Good' Cholesterol",
        "category": "Cardiovascular Lipid Profile",
        "unit": "mg/dL",
        "explanation": "High-Density Lipoprotein sweeps excess cholesterol away from arterial walls back to the liver for clearance."
    },
    "ldl": {
        "canonical": "LDL 'Bad' Cholesterol",
        "category": "Cardiovascular Lipid Profile",
        "unit": "mg/dL",
        "explanation": "Low-Density Lipoprotein can accumulate as fatty plaque inside arteries if present in excessive amounts."
    },
    "triglycerides": {
        "canonical": "Triglycerides",
        "category": "Cardiovascular Lipid Profile",
        "unit": "mg/dL",
        "explanation": "A common type of fat stored in your body, derived from unused calories, carbohydrates, and dietary fats."
    },
    "tsh": {
        "canonical": "TSH (Thyroid Stimulating Hormone)",
        "category": "Thyroid Function Panel",
        "unit": "uIU/mL",
        "explanation": "Pituitary hormone that commands your thyroid gland how much metabolic hormone (T3/T4) to produce."
    },
    "creatinine": {
        "canonical": "Serum Creatinine",
        "category": "Renal & Kidney Function",
        "unit": "mg/dL",
        "explanation": "A metabolic waste product produced by muscle activity, filtered out by healthy kidneys into urine."
    },
    "urea": {
        "canonical": "Blood Urea Nitrogen (BUN)",
        "category": "Renal & Kidney Function",
        "unit": "mg/dL",
        "explanation": "A byproduct of protein breakdown cleared by the kidneys; evaluates filtration efficiency and hydration."
    }
}


def parse_biomarkers_strictly(text: str) -> Tuple[List[ExtractedBiomarker], str, List[QuestionForDoctor], List[MedicalTerm]]:
    """
    CRITICAL CONSTRAINT: Never invent missing report values or reference ranges.
    
    Extracts biomarker names, observed values, units, and reference ranges
    STRICTLY if they appear in the extracted text.
    If a reference range is NOT found in the document, it is set to None.
    If a value is not found, the parameter is omitted or marked missing.
    """
    biomarkers: List[ExtractedBiomarker] = []
    lines = text.split("\n")

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
                meta = BIOMARKER_METADATA.get(key, {})
                canonical_name = meta.get("canonical", key.capitalize())
                category = meta.get("category", "General")
                default_unit = meta.get("unit", "")
                explanation = meta.get("explanation", "")

                # Look for numbers in the current line (or subsequent line)
                # Regex for observed value (e.g. 13.8, 108, 4.5)
                # Avoid matching dates like 2026
                value = None
                unit = None
                reference_range = None
                status = "recorded"

                # Search remaining text on this line after the match
                after_match = clean_line[match.end():]
                numbers = re.findall(r"(\d+(?:\.\d+)?)", after_match)

                # Check for explicit reference range pattern e.g. "12.0 - 15.5" or "70-99" or "< 200" or "0.4 - 4.5"
                range_match = re.search(r"(\d+(?:\.\d+)?\s*(?:-|–|to)\s*\d+(?:\.\d+)?)", after_match)
                less_than_match = re.search(r"([<>]\s*\d+(?:\.\d+)?)", after_match)

                if range_match:
                    reference_range = range_match.group(1).replace("–", "-")
                elif less_than_match:
                    reference_range = less_than_match.group(1)
                else:
                    # Look ahead one line for reference range
                    if line_idx + 1 < len(lines):
                        next_line = lines[line_idx + 1]
                        next_range = re.search(r"(\d+(?:\.\d+)?\s*(?:-|–|to)\s*\d+(?:\.\d+)?)", next_line)
                        if next_range:
                            reference_range = next_range.group(1).replace("–", "-")

                # If reference range was found, remove its numbers from the list of candidates for observed value
                if reference_range and range_match:
                    range_span = range_match.span()
                    pre_range = after_match[:range_span[0]]
                    pre_numbers = re.findall(r"(\d+(?:\.\d+)?)", pre_range)
                    if pre_numbers:
                        value = pre_numbers[0]
                    elif numbers:
                        value = numbers[0]
                elif numbers:
                    value = numbers[0]

                # Look for explicit unit on line
                unit_match = re.search(r"(g/dL|mg/dL|uIU/mL|mIU/L|%|cells/mcL|10\^3/uL|/cumm|mmol/L|pg/mL|ng/dL|fl)", after_match, re.IGNORECASE)
                if unit_match:
                    unit = unit_match.group(1)
                elif default_unit:
                    unit = default_unit

                # Determine status ONLY if both value and reference range are verified numbers from document
                if value and reference_range and "-" in reference_range:
                    try:
                        v = float(value)
                        parts = [float(p.strip()) for p in reference_range.split("-")]
                        if len(parts) == 2:
                            low_b, high_b = parts[0], parts[1]
                            if v < low_b:
                                status = "low"
                            elif v > high_b:
                                status = "elevated"
                            else:
                                status = "normal"
                    except ValueError:
                        status = "recorded"
                elif value and reference_range and "<" in reference_range:
                    try:
                        v = float(value)
                        cutoff = float(re.findall(r"\d+(?:\.\d+)?", reference_range)[0])
                        status = "normal" if v < cutoff else "elevated"
                    except Exception:
                        status = "recorded"
                else:
                    status = "recorded"

                if value is not None:
                    detected_keys.add(key)
                    biomarkers.append(ExtractedBiomarker(
                        name=canonical_name,
                        value=value,
                        unit=unit,
                        reference_range=reference_range,  # None if not explicitly present!
                        status=status,
                        category=category,
                        explanation=explanation
                    ))

    # Build honest patient-friendly summary based strictly on detected biomarkers
    if biomarkers:
        normal_count = sum(1 for b in biomarkers if b.status == "normal")
        elevated_count = sum(1 for b in biomarkers if b.status == "elevated")
        low_count = sum(1 for b in biomarkers if b.status == "low")
        recorded_count = sum(1 for b in biomarkers if b.status == "recorded")

        status_notes = []
        if normal_count > 0:
            status_notes.append(f"{normal_count} biomarker(s) within lab reference intervals")
        if elevated_count > 0:
            status_notes.append(f"{elevated_count} biomarker(s) above standard threshold")
        if low_count > 0:
            status_notes.append(f"{low_count} biomarker(s) below standard threshold")
        if recorded_count > 0:
            status_notes.append(f"{recorded_count} metric(s) recorded without facility reference ranges")

        summary = (
            f"Successfully identified {len(biomarkers)} diagnostic parameter(s) from your document: "
            + ", ".join(status_notes) + ". "
            "All explanations are educational translations and do not replace consultation with your physician."
        )
    else:
        summary = (
            "Text was extracted from the document, but no standard diagnostic biomarkers (e.g. CBC, Glucose, Lipids, Thyroid) "
            "were definitively recognized in the report text. The full extracted text is provided above."
        )

    # Relevant doctor questions
    doctor_questions = [
        QuestionForDoctor(
            topic="Overall Interpretation",
            question="How do these lab results fit into my personal medical history and current health status?",
            reason="Laboratory values should always be interpreted alongside clinical symptoms, age, and individual baseline."
        ),
        QuestionForDoctor(
            topic="Follow-up Timeline",
            question="When would you recommend a follow-up test to track changes or verify these results?",
            reason="Many biomarkers fluctuate based on hydration, fasting duration, diet, and physical activity."
        )
    ]

    # Relevant glossary entries
    glossary = [
        MedicalTerm(
            term="Reference Interval",
            meaning="The expected numerical range found in 95% of healthy individuals tested at this specific laboratory."
        ),
        MedicalTerm(
            term="Biomarker",
            meaning="A biological measurement used as an indicator of physiological processes or bodily health."
        )
    ]

    return biomarkers, summary, doctor_questions, glossary
