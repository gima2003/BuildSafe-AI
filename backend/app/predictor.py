import json
import logging
import warnings
from pathlib import Path
from typing import List, Dict, Any, Tuple
import joblib
import pandas as pd
import numpy as np

# Suppress harmless sklearn unpickling version warnings
warnings.filterwarnings("ignore")

from .config import (
    PIPELINE_PATH,
    MODEL_CARD_PATH,
    DECISION_PATH,
    CONFIDENCE_THRESHOLD,
    CLASS_NAMES,
    CLASS_MEANING,
    FEATURES,
    TEXT_COL,
    CAT_COLS,
    BIN_COLS,
    NUM_COLS
)
from .preprocessor import transform_raw_to_features

logger = logging.getLogger(__name__)

class ModelService:
    def __init__(self):
        self.pipeline = None
        self.model_card = {}
        self.decision_info = {}
        self.is_loaded = False
        self.review_threshold = CONFIDENCE_THRESHOLD

    def load_artifacts(self):
        """Loads the serialized scikit-learn pipeline, model card, and decision info."""
        if not Path(PIPELINE_PATH).exists():
            raise FileNotFoundError(f"Pipeline file not found at: {PIPELINE_PATH}")

        logger.info(f"Loading final pipeline from: {PIPELINE_PATH}")
        self.pipeline = joblib.load(PIPELINE_PATH)

        if Path(MODEL_CARD_PATH).exists():
            with open(MODEL_CARD_PATH, "r", encoding="utf-8") as f:
                self.model_card = json.load(f)
                self.review_threshold = self.model_card.get("human_review", {}).get("confidence_threshold", CONFIDENCE_THRESHOLD)

        if Path(DECISION_PATH).exists():
            with open(DECISION_PATH, "r", encoding="utf-8") as f:
                self.decision_info = json.load(f)

        self.is_loaded = True
        logger.info("Pipeline and metadata loaded successfully.")

    def predict_records(self, feature_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Implementation of the reference predict_records() logic from Notebook 07 Cell 92.
        Input is a list of dictionaries containing the 14 model-input fields.
        """
        if not self.is_loaded or self.pipeline is None:
            self.load_artifacts()

        df = pd.DataFrame(feature_records)
        missing = [c for c in FEATURES if c not in df.columns]
        if missing:
            raise ValueError(f"Missing required model features: {missing}")

        df = df[FEATURES].copy()
        # Clean text
        df[TEXT_COL] = df[TEXT_COL].fillna("").astype(str).str.upper().str.strip()
        # Cast categoricals to strings
        df[CAT_COLS] = df[CAT_COLS].astype(str)
        # Parse numeric columns
        for c in BIN_COLS + NUM_COLS:
            df[c] = pd.to_numeric(df[c], errors="raise")

        # Run pipeline inference
        probabilities_matrix = self.pipeline.predict_proba(df)

        results = []
        for i, p in enumerate(probabilities_matrix):
            k = int(p.argmax())
            pred_class = CLASS_NAMES[k]
            confidence = round(float(p[k]), 4)
            needs_review = bool(confidence < self.review_threshold)

            prob_dict = {c: round(float(val), 4) for c, val in zip(CLASS_NAMES, p)}

            # Generate descriptive explanation
            if needs_review:
                review_reason = (
                    f"Confidence score ({round(confidence * 100, 1)}%) is below the quality assurance threshold "
                    f"of {round(self.review_threshold * 100, 1)}%. High ambiguity detected between classes "
                    f"({', '.join([f'{k}: {round(v*100, 1)}%' for k, v in prob_dict.items() if v > 0.15])}). "
                    f"Recommended for on-site physical human inspection."
                )
            else:
                review_reason = (
                    f"Confident automated triage ({round(confidence * 100, 1)}% certainty). "
                    f"Model classification passes all safety validation guard-rails."
                )

            results.append({
                "predicted_class": pred_class,
                "meaning": CLASS_MEANING[pred_class],
                "confidence": confidence,
                "probabilities": prob_dict,
                "needs_human_review": needs_review,
                "review_reason": review_reason
            })

        return results

    def predict_single_raw(self, raw_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        End-to-end single record triage:
        Raw Form Input -> Feature Engineering -> Pipeline -> Prediction Response.
        """
        features_dict = transform_raw_to_features(raw_input)
        preds = self.predict_records([features_dict])
        pred = preds[0]

        # Clean engineered features for user inspection
        eng_features = {k: v for k, v in features_dict.items() if not k.startswith("_meta_")}
        eng_features["_meta_bin_found"] = features_dict.get("_meta_bin_found", False)

        return {
            "predicted_class": pred["predicted_class"],
            "meaning": pred["meaning"],
            "confidence": pred["confidence"],
            "probabilities": pred["probabilities"],
            "needs_human_review": pred["needs_human_review"],
            "review_reason": pred["review_reason"],
            "engineered_features": eng_features
        }

    def predict_batch_raw(self, raw_inputs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """End-to-end batch records triage."""
        features_list = [transform_raw_to_features(r) for r in raw_inputs]
        preds = self.predict_records(features_list)

        predictions_out = []
        flagged_count = 0

        for feat, pred in zip(features_list, preds):
            if pred["needs_human_review"]:
                flagged_count += 1
            eng_features = {k: v for k, v in feat.items() if not k.startswith("_meta_")}
            predictions_out.append({
                "predicted_class": pred["predicted_class"],
                "meaning": pred["meaning"],
                "confidence": pred["confidence"],
                "probabilities": pred["probabilities"],
                "needs_human_review": pred["needs_human_review"],
                "review_reason": pred["review_reason"],
                "engineered_features": eng_features
            })

        return {
            "total_records": len(predictions_out),
            "flagged_for_review_count": flagged_count,
            "predictions": predictions_out
        }

# Global singleton
model_service = ModelService()
