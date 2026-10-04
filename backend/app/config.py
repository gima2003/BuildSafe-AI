import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
RESULTS_DIR = BASE_DIR / "results"

# Pipeline & Model Paths
PIPELINE_PATH = MODELS_DIR / "buildsafe_final_pipeline.joblib"
MODEL_CARD_PATH = MODELS_DIR / "buildsafe_final_model_card.json"
BIN_HISTORY_PATH = ARTIFACTS_DIR / "bin_history_lookup.csv"
DECISION_PATH = RESULTS_DIR / "final_model_decision.json"

# Thresholds and Fallbacks
CONFIDENCE_THRESHOLD = 0.65  # Validation-calibrated cutoff for human review flag
CLASS_NAMES = ["CLASS - 1", "CLASS - 2", "CLASS - 3"]
CLASS_MEANING = {
    "CLASS - 1": "Immediately hazardous",
    "CLASS - 2": "Major",
    "CLASS - 3": "Lesser"
}

# Features List in strict schema order
FEATURES = [
    "DESC_CLEAN",
    "BORO",
    "VIOLATION_TYPE",
    "RESPONDENT_TYPE",
    "DOB_UNIT",
    "ISSUE_MONTH",
    "ISSUE_DAYOFWEEK",
    "IS_WEEKEND",
    "HAS_DOB_VIOLATION",
    "AGGRAVATED_ORD",
    "BIN_PRIOR_VIOLATIONS",
    "BIN_PRIOR_CLASS1",
    "BIN_DAYS_SINCE_PREV",
    "DESC_WORDS"
]

TEXT_COL = "DESC_CLEAN"
CAT_COLS = [
    "BORO",
    "VIOLATION_TYPE",
    "RESPONDENT_TYPE",
    "DOB_UNIT",
    "ISSUE_MONTH",
    "ISSUE_DAYOFWEEK"
]
BIN_COLS = ["IS_WEEKEND", "HAS_DOB_VIOLATION"]
NUM_COLS = [
    "AGGRAVATED_ORD",
    "BIN_PRIOR_VIOLATIONS",
    "BIN_PRIOR_CLASS1",
    "BIN_DAYS_SINCE_PREV",
    "DESC_WORDS"
]
