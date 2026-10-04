from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any

class ViolationInput(BaseModel):
    description: str = Field(
        ...,
        description="Violation description text",
        example="FAILURE TO MAINTAIN EXTERIOR BUILDING WALL REPAIR CRACK"
    )
    borough: str = Field(
        ...,
        description="NYC Borough: '1' (Manhattan), '2' (Bronx), '3' (Brooklyn), '4' (Queens), '5' (Staten Island)",
        example="1"
    )
    violation_type: str = Field(
        ...,
        description="Violation category type (e.g. Construction, Boilers, Elevators, etc.)",
        example="Construction"
    )
    respondent: Optional[str] = Field(
        default="",
        description="Name of the respondent or entity cited",
        example="NYC HOUSING AUTHORITY"
    )
    issue_date: str = Field(
        ...,
        description="Date of issuance in YYYY-MM-DD or YYYYMMDD format",
        example="2026-06-15"
    )
    aggravation_level: Optional[str] = Field(
        default="NO",
        description="Aggravated offense level ('NO', 'AGGRAVATED OFFENSE LEVEL 1', 'AGGRAVATED OFFENSE LEVEL 2')",
        example="NO"
    )
    bin: Optional[str] = Field(
        default="",
        description="7-digit NYC Building Identification Number (BIN)",
        example="1000007"
    )
    dob_violation_number: Optional[str] = Field(
        default="",
        description="Optional DOB violation tracking number (e.g. 12345678CUPK01)",
        example=""
    )

class PredictionResponse(BaseModel):
    predicted_class: str = Field(..., description="Predicted class code: 'CLASS - 1', 'CLASS - 2', or 'CLASS - 3'")
    meaning: str = Field(..., description="Human-readable interpretation: Immediately hazardous, Major, or Lesser")
    confidence: float = Field(..., description="Maximum class probability (0.0 to 1.0)")
    probabilities: Dict[str, float] = Field(..., description="Probability breakdown across all 3 severity classes")
    needs_human_review: bool = Field(..., description="True if confidence is below 0.65 validation-calibrated threshold")
    review_reason: Optional[str] = Field(None, description="Detailed explanation if review is required")
    engineered_features: Dict[str, Any] = Field(..., description="Transparent breakdown of preprocessed features fed to model")

class BatchPredictionRequest(BaseModel):
    records: List[ViolationInput]

class BatchPredictionResponse(BaseModel):
    total_records: int
    flagged_for_review_count: int
    predictions: List[PredictionResponse]

class BuildingHistoryResponse(BaseModel):
    bin: str
    exists: bool
    total_violations: int
    total_class1: int
    last_issue_date: Optional[str]
    days_since_prev_estimate: Optional[float]

class ModelCardResponse(BaseModel):
    project: str
    final_model_name: str
    family: str
    cv_macro_f1: float
    test_metrics: Dict[str, Any]
    review_threshold: float
    classes: Dict[str, Any]
    top_features: List[List[Any]]
    limitations: List[str]
