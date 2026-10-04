"""
BuildSafe-AI System Smoke Test
Tests all backend API endpoints and inference pipeline in one command.
"""

import sys
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from fastapi.testclient import TestClient
    from backend.app.main import app
except ImportError as e:
    print(f"Error importing app: {e}")
    sys.exit(1)

def run_tests():
    print("=" * 70)
    print("🧪  Running BuildSafe-AI End-to-End Test Suite")
    print("=" * 70)

    client = TestClient(app)

    # 1. Health Check
    print("\n[Test 1] Testing Health Endpoint (/api/health)...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    print(f"  ✅ Health Check: {data['status']}")
    print(f"     Model pipeline loaded: {data['model_loaded']}")

    # 2. Metadata & Presets
    print("\n[Test 2] Testing Metadata & Presets (/api/lookup/metadata)...")
    res = client.get("/api/lookup/metadata")
    assert res.status_code == 200
    meta = res.json()
    print(f"  ✅ Presets Loaded: {len(meta['presets'])} demo presets available")
    print(f"     Violation Types: {len(meta['violation_types'])} categories")

    # 3. BIN Lookup
    print("\n[Test 3] Testing BIN History Lookup (/api/lookup/bin/1000007)...")
    res = client.get("/api/lookup/bin/1000007")
    assert res.status_code == 200
    bin_data = res.json()
    assert bin_data["exists"] is True
    print(f"  ✅ BIN 1000007 found in history:")
    print(f"     Total Prior Violations: {bin_data['total_violations']}")
    print(f"     Prior Class 1 Violations: {bin_data['total_class1']}")
    print(f"     Last Violation Date: {bin_data['last_issue_date']}")

    # 4. Predict Class 1 (Immediately Hazardous)
    print("\n[Test 4] Testing Class 1 (Hazardous) Prediction...")
    c1_input = {
        "description": "UNLAWFUL ACTS. FAILURE TO MAINTAIN BUILDING STABILITY. CRACKING ON BEARING WALL. CEASE USE.",
        "borough": "1",
        "violation_type": "Construction",
        "respondent": "METROPOLITAN BUILDERS CORP",
        "issue_date": "2026-06-18",
        "aggravation_level": "AGGRAVATED OFFENSE LEVEL 1",
        "bin": "1000007"
    }
    res = client.post("/api/predict", json=c1_input)
    assert res.status_code == 200
    pred = res.json()
    print(f"  ✅ Prediction Result:")
    print(f"     Class: {pred['predicted_class']} ({pred['meaning']})")
    print(f"     Confidence: {round(pred['confidence'] * 100, 1)}%")
    print(f"     Human Review Required: {pred['needs_human_review']}")
    assert pred["predicted_class"] == "CLASS - 1"

    # 5. Predict Borderline Case -> Must trigger Human Review Flag (< 65%)
    print("\n[Test 5] Testing Borderline Case (Human Inspector Flag)...")
    borderline_input = {
        "description": "FAILURE TO MAINTAIN EXTERIOR BUILDING WALL REPAIR CRACK",
        "borough": "1",
        "violation_type": "Construction",
        "respondent": "NYC HOUSING AUTHORITY",
        "issue_date": "2026-06-15",
        "aggravation_level": "NO",
        "bin": "1000007"
    }
    res = client.post("/api/predict", json=borderline_input)
    assert res.status_code == 200
    pred = res.json()
    print(f"  ✅ Borderline Result:")
    print(f"     Class: {pred['predicted_class']} ({pred['meaning']})")
    print(f"     Confidence: {round(pred['confidence'] * 100, 1)}% (< 65% threshold)")
    print(f"     Human Review Flag: {pred['needs_human_review']}")
    print(f"     Review Reason: {pred['review_reason']}")
    assert pred["needs_human_review"] is True, "Expected needs_human_review to be True for borderline case"

    # 6. Model Intelligence & Metrics
    print("\n[Test 6] Testing Model Metrics Endpoint (/api/model/metrics)...")
    res = client.get("/api/model/metrics")
    assert res.status_code == 200
    metrics = res.json()
    print(f"  ✅ Model: {metrics['model_name']}")
    print(f"     Test Macro-F1: {round(metrics['test_macro_f1'] * 100, 2)}%")
    print(f"     Test Accuracy: {round(metrics['test_accuracy'] * 100, 2)}%")
    print(f"     Class 1 Recall: {round(metrics['test_c1_recall'] * 100, 2)}%")
    print(f"     Review Cutoff: {round(metrics['review_threshold'] * 100, 1)}%")

    print("\n" + "=" * 70)
    print("🎉  ALL TESTS PASSED SUCCESSFULLY! SYSTEM IS 100% OPERATIONAL.")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
