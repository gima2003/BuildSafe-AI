from fastapi import APIRouter
from pathlib import Path
import pandas as pd
import json

from ..config import RESULTS_DIR, MODEL_CARD_PATH, DECISION_PATH
from ..predictor import model_service

router = APIRouter(prefix="/api/model", tags=["Model Intelligence"])

@router.get("/info")
def get_model_info():
    """
    Returns full metadata for the production model card,
    including hyperparameters, CV metrics, test CI, and limitations.
    """
    if not model_service.is_loaded:
        model_service.load_artifacts()

    return {
        "model_card": model_service.model_card,
        "decision": model_service.decision_info
    }

@router.get("/candidates")
def get_candidate_models():
    """
    Returns the 5 candidate models evaluated during Stage 7
    (Linear SVM, LightGBM, Random Forest, Logistic Regression, XGBoost)
    with their CV macro-F1, Class 1/3 recall, eligibility, and selection trail.
    """
    candidates_csv = RESULTS_DIR / "stage7_candidates.csv"
    if candidates_csv.exists():
        df = pd.read_csv(candidates_csv)
        return df.to_dict(orient="records")
    
    # Fallback to model_card candidates
    if not model_service.is_loaded:
        model_service.load_artifacts()
    return model_service.model_card.get("selection", {}).get("candidates", [])

@router.get("/metrics")
def get_metrics_summary():
    """
    Returns high-level production performance metrics.
    """
    if not model_service.is_loaded:
        model_service.load_artifacts()
    
    test_metrics = model_service.model_card.get("metrics", {}).get("test", {})
    cv_macro_f1 = model_service.model_card.get("metrics", {}).get("cv_macro_f1", [0.7719, 0.0047])
    
    return {
        "model_name": model_service.model_card.get("final_model", {}).get("name", "Logistic Regression [tuned]"),
        "cv_macro_f1_mean": cv_macro_f1[0] if isinstance(cv_macro_f1, list) else cv_macro_f1,
        "cv_macro_f1_std": cv_macro_f1[1] if isinstance(cv_macro_f1, list) and len(cv_macro_f1) > 1 else 0.0,
        "test_macro_f1": test_metrics.get("macro_f1", 0.7711),
        "test_accuracy": test_metrics.get("accuracy", 0.8223),
        "test_c1_recall": test_metrics.get("c1_recall", 0.8611),
        "test_c1_precision": test_metrics.get("c1_precision", 0.7913),
        "test_c3_recall": test_metrics.get("c3_recall", 0.7185),
        "test_macro_auc": test_metrics.get("macro_auc_ovr", 0.9423),
        "review_threshold": model_service.review_threshold,
        "top_features": model_service.model_card.get("top_features", [])[:15]
    }
