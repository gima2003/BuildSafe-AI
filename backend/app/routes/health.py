from fastapi import APIRouter
import platform
import sklearn
import pandas
import joblib

from ..predictor import model_service
from ..config import PIPELINE_PATH

router = APIRouter(prefix="/api", tags=["Health & Status"])

@router.get("/health")
def health_check():
    """
    Health check endpoint verifying model readiness, artifact presence, and package versions.
    """
    return {
        "status": "healthy" if model_service.is_loaded else "ready",
        "pipeline_file": str(PIPELINE_PATH.name),
        "pipeline_exists": PIPELINE_PATH.exists(),
        "model_loaded": model_service.is_loaded,
        "environment": {
            "python_version": platform.python_version(),
            "sklearn_version": sklearn.__version__,
            "pandas_version": pandas.__version__,
            "joblib_version": joblib.__version__
        }
    }
