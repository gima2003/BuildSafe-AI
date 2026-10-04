/**
 * BuildSafe-AI API Service
 * Communicates with the FastAPI backend (http://127.0.0.1:8000/api).
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error("Health check failed");
    return await res.json();
  } catch (err) {
    return { status: "offline", error: err.message };
  }
}

export async function getMetadata() {
  try {
    const res = await fetch(`${API_BASE_URL}/lookup/metadata`);
    if (!res.ok) throw new Error("Failed to load metadata");
    return await res.json();
  } catch (err) {
    console.warn("Using offline fallback for metadata:", err);
    return getOfflineMetadata();
  }
}

export async function lookupBin(bin) {
  try {
    const res = await fetch(`${API_BASE_URL}/lookup/bin/${encodeURIComponent(bin)}`);
    if (!res.ok) throw new Error("BIN lookup failed");
    return await res.json();
  } catch (err) {
    console.warn("BIN lookup offline fallback:", err);
    return {
      bin,
      exists: false,
      total_violations: 0,
      total_class1: 0,
      last_issue_date: null,
      days_since_prev_estimate: 1000.0
    };
  }
}

export async function predictViolation(data) {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${res.statusText}`);
  }

  return await res.json();
}

export async function predictBatch(records) {
  const res = await fetch(`${API_BASE_URL}/predict/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ records }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Batch triage error: ${res.statusText}`);
  }

  return await res.json();
}

export async function predictCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/predict/csv`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `CSV triage error: ${res.statusText}`);
  }

  return await res.json();
}

export async function getModelMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/model/metrics`);
    if (!res.ok) throw new Error("Metrics fetch failed");
    return await res.json();
  } catch (err) {
    console.warn("Offline fallback for metrics:", err);
    return {
      model_name: "Logistic Regression [tuned]",
      cv_macro_f1_mean: 0.7719,
      cv_macro_f1_std: 0.0047,
      test_macro_f1: 0.7711,
      test_accuracy: 0.8223,
      test_c1_recall: 0.8611,
      test_c1_precision: 0.7913,
      test_c3_recall: 0.7185,
      test_macro_auc: 0.9423,
      review_threshold: 0.65,
      top_features: [
        ["text__AND REPLACE", 0.000869],
        ["text__OBTAIN PERMIT", 0.000764],
        ["text__OR REPLACE", 0.000751],
        ["text__OBTAIN ALL", 0.000710],
        ["text__AND OR", 0.000580],
        ["text__ALL PERMITS", 0.000579],
        ["text__FENCE", 0.000447],
        ["text__CEASE", 0.000422],
        ["text__PERMIT OR", 0.000391],
        ["text__FILE CERTIFICATE", 0.000374]
      ]
    };
  }
}

export async function getModelCandidates() {
  try {
    const res = await fetch(`${API_BASE_URL}/model/candidates`);
    if (!res.ok) throw new Error("Candidates fetch failed");
    return await res.json();
  } catch (err) {
    return [
      {
        Candidate: "Logistic Regression [tuned]",
        "CV macro-F1": 0.7719,
        std: 0.0047,
        "CV C1 recall": 0.8408,
        "CV C1 precision": 0.8138,
        "CV C3 recall": 0.7300,
        "C1 >= 0.80": true,
        "C3 >= 0.55": true,
        "has probabilities": true,
        eligible: true
      },
      {
        Candidate: "LightGBM [tuned+k/alpha]",
        "CV macro-F1": 0.7748,
        std: 0.0037,
        "CV C1 recall": 0.8422,
        "CV C1 precision": 0.8142,
        "CV C3 recall": 0.6498,
        "C1 >= 0.80": true,
        "C3 >= 0.55": true,
        "has probabilities": true,
        eligible: true
      },
      {
        Candidate: "Random Forest [tuned]",
        "CV macro-F1": 0.7727,
        std: 0.0052,
        "CV C1 recall": 0.8231,
        "CV C1 precision": 0.8158,
        "CV C3 recall": 0.6024,
        "C1 >= 0.80": true,
        "C3 >= 0.55": true,
        "has probabilities": true,
        eligible: true
      },
      {
        Candidate: "Linear SVM [tuned]",
        "CV macro-F1": 0.7768,
        std: 0.0072,
        "CV C1 recall": 0.8316,
        "CV C1 precision": 0.8206,
        "CV C3 recall": 0.6719,
        "C1 >= 0.80": true,
        "C3 >= 0.55": true,
        "has probabilities": false,
        eligible: false
      },
      {
        Candidate: "XGBoost [tuned+k/alpha]",
        "CV macro-F1": 0.7654,
        std: 0.0034,
        "CV C1 recall": 0.8495,
        "CV C1 precision": 0.7964,
        "CV C3 recall": 0.7060,
        "C1 >= 0.80": true,
        "C3 >= 0.55": true,
        "has probabilities": true,
        eligible: true
      }
    ];
  }
}

function getOfflineMetadata() {
  return {
    boroughs: [
      { code: "1", name: "Manhattan" },
      { code: "2", name: "Bronx" },
      { code: "3", name: "Brooklyn" },
      { code: "4", name: "Queens" },
      { code: "5", name: "Staten Island" }
    ],
    violation_types: [
      "Boilers",
      "Construction",
      "Cranes and Derricks",
      "Elevators",
      "Local Law",
      "Plumbing",
      "Public Assembly",
      "Quality of Life",
      "Signs",
      "Site Safety",
      "Unknown",
      "Zoning"
    ],
    aggravation_levels: [
      { value: "NO", label: "No Aggravation (Standard)" },
      { value: "AGGRAVATED OFFENSE LEVEL 1", label: "Aggravated Offense Level 1" },
      { value: "AGGRAVATED OFFENSE LEVEL 2", label: "Aggravated Offense Level 2 (Severe Repeat Offender)" }
    ],
    presets: [
      {
        id: "preset_class1_hazard",
        title: "Severe Structural Hazard (Class 1)",
        subtitle: "Demolition without shoring, active exterior cracking",
        expected_class: "CLASS - 1",
        data: {
          description: "UNLAWFUL ACTS. FAILURE TO COMPLY WITH COMMISSIONER'S ORDER. FAILURE TO MAINTAIN BUILDING STABILITY DURING DEMOLITION WORK. CRACKING AND BULGING OBSERVED ON EXTERIOR BEARING WALL. CEASE USE AND PROVIDE IMMEDIATE SHORING.",
          borough: "1",
          violation_type: "Construction",
          respondent: "METROPOLITAN BUILDERS CORP",
          issue_date: "2026-06-18",
          aggravation_level: "AGGRAVATED OFFENSE LEVEL 1",
          bin: "1000007",
          dob_violation_number: "39162126CUPK01"
        }
      },
      {
        id: "preset_class2_major",
        title: "Illegal Occupancy & Work Without Permit (Class 2)",
        subtitle: "Basement residential unit converted into commercial spa",
        expected_class: "CLASS - 2",
        data: {
          description: "WORK WITHOUT A PERMIT. NOTED RESIDENTIAL 2ND FLOOR APARTMENT CONVERTED INTO COMMERCIAL SPA BUSINESS MABEL SPA LLC WITH NEW PARTITIONS AND PLUMBING FIXTURES WITHOUT VALID DOB APPROVAL.",
          borough: "2",
          violation_type: "Construction",
          respondent: "ZAPATA NEPTALI",
          issue_date: "2026-06-01",
          aggravation_level: "NO",
          bin: "2026562",
          dob_violation_number: ""
        }
      },
      {
        id: "preset_class3_lesser",
        title: "Expired Signage & Minor Non-Hazard (Class 3)",
        subtitle: "Commercial roof sign lacking certificate of registration",
        expected_class: "CLASS - 3",
        data: {
          description: "OUTDOOR ADVERTISING SIGN DISPLAYED WITHOUT VALID CERTIFICATE OF REGISTRATION. MAINTAINING ILLUMINATED SIGN EXCEEDING ALLOWABLE SQUARE FOOTAGE ON ROOF. FILE CERTIFICATE AND ALL PERMITS WITH COMMISSIONER.",
          borough: "4",
          violation_type: "Signs",
          respondent: "CLEAR CHANNEL OUTDOOR INC",
          issue_date: "2026-05-20",
          aggravation_level: "NO",
          bin: "4001234",
          dob_violation_number: ""
        }
      },
      {
        id: "preset_human_review",
        title: "Borderline Triage (Triggers Human Review Flag)",
        subtitle: "Conflicting structural defect signals; confidence 54.2% < 65% threshold",
        expected_class: "Needs Human Review (Flagged)",
        data: {
          description: "FAILURE TO MAINTAIN EXTERIOR BUILDING WALL REPAIR CRACK",
          borough: "1",
          violation_type: "Construction",
          respondent: "NYC HOUSING AUTHORITY",
          issue_date: "2026-06-15",
          aggravation_level: "NO",
          bin: "1000007",
          dob_violation_number: ""
        }
      }
    ]
  };
}
