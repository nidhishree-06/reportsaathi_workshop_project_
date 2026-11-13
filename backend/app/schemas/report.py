from typing import List, Optional, Any
from pydantic import BaseModel, Field

class SourceExtractedFact(BaseModel):
    test_name: str = Field(..., description="Exact name of the test or biomarker as extracted from the report")
    extracted_value: Optional[str] = Field(None, description="Reported value (number or string) or null if missing in report")
    unit: Optional[str] = Field(None, description="Measurement unit (e.g., g/dL, mg/dL) or null if not printed")
    reference_range: Optional[str] = Field(None, description="Normal reference interval ONLY if explicitly present in the report; null otherwise. NEVER invent.")

class AIExplanation(BaseModel):
    simple_explanation: str = Field(..., description="Educational plain-language translation of what this biomarker represents in everyday terms")
    status: str = Field("not_specified", description="'normal', 'elevated', 'low', 'unclear', or 'not_specified'")
    clarity_note: Optional[str] = Field(None, description="Note when information is missing, unclear, cut off, or ambiguous on the report")

class AnalyzedBiomarker(BaseModel):
    source_fact: SourceExtractedFact
    ai_explanation: AIExplanation

class QuestionForDoctor(BaseModel):
    topic: str = Field(..., description="Parameter or general concern")
    question: str = Field(..., description="Thoughtful, patient-empowered question to ask your doctor")
    reason: str = Field(..., description="Educational rationale for why this question is helpful")

class MedicalTerm(BaseModel):
    term: str = Field(..., description="Medical abbreviation or clinical term (e.g., MCV, TSH)")
    meaning: str = Field(..., description="Simple, everyday analogy explanation")

class GeminiAnalysisResponse(BaseModel):
    report_title: str = Field(default="Laboratory Report Analysis", description="Descriptive title of the lab panel")
    patient_summary: str = Field(..., description="1-2 gentle, educational paragraphs summarizing the findings without diagnosing or claiming certainty")
    overall_status: str = Field(default="Reviewed", description="High-level status phrase")
    is_unclear: bool = Field(default=False, description="True if report text is blurry, missing data, or difficult to interpret")
    unclear_advisory: Optional[str] = Field(
        None, 
        description="Advisory message if report is unclear, advising consultation with a qualified clinician"
    )
    tests: List[AnalyzedBiomarker] = Field(default_factory=list)
    doctor_questions: List[QuestionForDoctor] = Field(default_factory=list)
    glossary: List[MedicalTerm] = Field(default_factory=list)
    disclaimer: str = Field(
        default="EDUCATIONAL USE ONLY: ReportSaathi does not diagnose, prescribe treatment, or claim clinical certainty. Always consult a qualified clinician."
    )

class FileInfo(BaseModel):
    filename: str
    file_type: str
    file_size_bytes: int
    page_count: int = 1
    extraction_method: str = Field(..., description="'digital_pdf', 'ocr_scanned_pdf', 'ocr_image', or 'hybrid_pdf'")

# Flattened biomarker for easy UI consumption while preserving source vs AI separation
class ExtractedBiomarker(BaseModel):
    name: str
    value: Optional[str] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None  # None if not explicitly present in the report! Never invented.
    status: str = "recorded"  # "normal", "elevated", "low", "recorded", "unclear"
    category: str = "General"
    explanation: str = ""
    clarity_note: Optional[str] = None
    is_source_verified: bool = True

class ReportAnalysisResponse(BaseModel):
    processing_status: str = Field("success", description="'success' or 'partial'")
    file_info: FileInfo
    extracted_text: str
    character_count: int
    analysis: GeminiAnalysisResponse
    # Flattened helpers for frontend components:
    biomarkers: List[ExtractedBiomarker] = Field(default_factory=list)
    summary: str
    overall_status: str = "Reviewed"
    is_unclear: bool = False
    unclear_advisory: Optional[str] = None
    doctor_questions: List[QuestionForDoctor] = Field(default_factory=list)
    glossary: List[MedicalTerm] = Field(default_factory=list)
    disclaimer: str = (
        "EDUCATIONAL USE ONLY: ReportSaathi does not diagnose, prescribe treatment, or claim clinical certainty. "
        "Laboratory reference intervals vary across clinical facilities. Always consult a qualified clinician."
    )

# Supabase History Models
class SaveReportRequest(BaseModel):
    user_id: str
    report_title: str
    overall_status: str = "Reviewed"
    summary: str
    biomarkers: List[ExtractedBiomarker] = Field(default_factory=list)
    file_name: Optional[str] = "report.pdf"

class SaveReportResponse(BaseModel):
    saved: bool
    report_id: Optional[str] = None
    is_demo: bool = False
    message: str
    stored_fields: List[str] = [
        "report_title", "overall_status", "summary", "biomarkers_summary", "file_name", "created_at"
    ]
    not_stored_fields: List[str] = [
        "original_uploaded_file", "raw_medical_ocr_text", "unredacted_pii"
    ]

# Backward compatibility models
class ExtractionResponse(BaseModel):
    filename: str
    file_type: str
    extracted_text: str
    page_count: int
    extraction_method: str
    character_count: int

class ExplainRequest(BaseModel):
    raw_text: str
    filename: Optional[str] = "Uploaded Report"

class TestParameter(BaseModel):
    name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    status: str = "normal"
    summary: str = ""

class ReportCategory(BaseModel):
    category_name: str
    parameters: List[TestParameter] = Field(default_factory=list)

class ReportExplanationResponse(BaseModel):
    report_title: str = Field(default="Lab Test Explanation")
    patient_friendly_summary: str
    overall_status: str = "Reviewed"
    categories: List[ReportCategory] = Field(default_factory=list)
    actionable_questions: List[QuestionForDoctor] = Field(default_factory=list)
    glossary: List[MedicalTerm] = Field(default_factory=list)
    lifestyle_diet_notes: List[str] = Field(default_factory=list)
    disclaimer: str = (
        "This summary is generated for educational purposes only and does NOT constitute medical advice, diagnosis, or treatment. Always discuss your results with a qualified healthcare provider."
    )
