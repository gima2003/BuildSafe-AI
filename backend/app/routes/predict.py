import io
import csv
from typing import List
from fastapi import APIRouter, HTTPException, UploadFile, File
import pandas as pd

from ..schemas import (
    ViolationInput,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse
)
from ..predictor import model_service

router = APIRouter(prefix="/api", tags=["Prediction"])

@router.post("/predict", response_model=PredictionResponse)
def predict_single(violation: ViolationInput):
    """
    Predict severity class and human review requirement for a single NYC DOB violation.
    Maps raw inputs into 14 pipeline features, applies trained models/buildsafe_final_pipeline.joblib,
    and returns class, probabilities, confidence, and human review flag.
    """
    try:
        raw_dict = violation.model_dump()
        result = model_service.predict_single_raw(raw_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.post("/predict/batch", response_model=BatchPredictionResponse)
def predict_batch(batch_request: BatchPredictionRequest):
    """
    Batch triage for a list of violations.
    """
    try:
        raw_list = [item.model_dump() for item in batch_request.records]
        result = model_service.predict_batch_raw(raw_list)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch inference error: {str(e)}")

@router.post("/predict/csv", response_model=BatchPredictionResponse)
async def predict_csv(file: UploadFile = File(...)):
    """
    Upload a CSV file containing violations for automated batch triage.
    Accepts standard CSV headers (e.g. description/VIOLATION_DESCRIPTION, boro/BORO, etc.).
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Standardize column names
        col_map = {
            "VIOLATION_DESCRIPTION": "description",
            "BORO": "borough",
            "VIOLATION_TYPE": "violation_type",
            "RESPONDENT_NAME": "respondent",
            "ISSUE_DATE": "issue_date",
            "AGGRAVATED_LEVEL": "aggravation_level",
            "BIN": "bin",
            "DOB_VIOLATION_NUMBER": "dob_violation_number"
        }
        df = df.rename(columns={k: v for k, v in col_map.items() if k in df.columns})

        # Fill defaults
        if "description" not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain a 'description' or 'VIOLATION_DESCRIPTION' column.")
        
        records = df.to_dict(orient="records")
        result = model_service.predict_batch_raw(records)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")
