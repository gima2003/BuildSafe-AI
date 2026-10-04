import re
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, Optional

from .config import (
    BIN_HISTORY_PATH,
    FEATURES,
    TEXT_COL,
    CAT_COLS,
    BIN_COLS,
    NUM_COLS
)

# Regex patterns directly from Notebook 02
MONTHS_PATTERN = r'\b(JAN|JANUARY|FEB|FEBRUARY|MARCH|APRIL|JUNE|JULY|AUG|AUGUST|SEPT|SEPTEMBER|OCT|OCTOBER|NOV|NOVEMBER|DEC|DECEMBER)\b'
CLASS_LEAK_PATTERN = r'CLASS\s*[-#:.]?\s*[123](?![0-9])'

GOV_PATTERN = r'DEPARTMENT|DEPT|\bNYC\b|CITY OF|HOUSING AUTH|SCHOOL|BOARD OF ED|\bHPD\b|\bDOE\b|AUTHORITY|\bMTA\b|STATE OF'
ORG_PATTERN = (
    r'\bLLC\b|\bINC\b|CORP|\bCO\b|LTD|\bLP\b|ASSOC|REALTY|MGMT|MANAGEMENT|TRUST|CONDO|CONSTRUCT|DEVELOP|PROPERT|'
    r'HOLDING|GROUP|BUILDERS|CONTRACT|SERVICES|ENTERPRISE|OWNER|CHURCH|HOSPITAL|UNIVERSITY|COOP|CO-OP|HDFC|L\.L\.C'
)

# In-memory cached lookup table
_bin_lookup_cache: Optional[Dict[str, Dict[str, Any]]] = None

def load_bin_history_lookup() -> Dict[str, Dict[str, Any]]:
    """Loads and caches the building history lookup CSV from artifacts."""
    global _bin_lookup_cache
    if _bin_lookup_cache is None:
        if Path(BIN_HISTORY_PATH).exists():
            df = pd.read_csv(BIN_HISTORY_PATH)
            # Ensure BIN is string
            df["BIN"] = df["BIN"].astype(str).str.split(".").str[0].str.strip()
            # Map by BIN
            _bin_lookup_cache = df.set_index("BIN").to_dict(orient="index")
        else:
            _bin_lookup_cache = {}
    return _bin_lookup_cache

def clean_description(s: str) -> str:
    """Row-wise text cleaning and leakage masking from Notebook 02 Cell 12."""
    if not s or pd.isna(s):
        return ""
    s = str(s).upper()
    # Mask URLs
    s = re.sub(r'HTTPS?://\S+|WWW\.\S+', ' URL ', s)
    # Mask class leakage
    s = re.sub(CLASS_LEAK_PATTERN, ' ', s)
    s = re.sub(r'\bIMMEDIATELY\s+HAZARDOUS\b', ' ', s)
    s = re.sub(r'\b(MAJOR|LESSER)\b', ' ', s)
    # Mask dates and month names
    s = re.sub(r'\b\d{1,2}/\d{1,2}/\d{2,4}\b', ' DATE ', s)
    s = re.sub(MONTHS_PATTERN, ' DATE ', s)
    # Mask permit, job, and device numbers
    s = re.sub(r'\b[A-Z]{0,3}\d{6,}[A-Z0-9-]*\b', ' IDNUM ', s)
    # Filter permitted characters: keep legal section references e.g. 28-105.1
    s = re.sub(r'[^A-Z0-9\.\-/ ]', ' ', s)
    # Re-apply class masking in case punctuation removal created new matches
    s = re.sub(CLASS_LEAK_PATTERN, ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def get_respondent_type(name: str) -> str:
    """Rule-based respondent type categorization from Notebook 02 Cell 14."""
    if not name or pd.isna(name):
        return "UNKNOWN"
    n = str(name).upper().strip()
    if not n:
        return "UNKNOWN"
    if re.search(GOV_PATTERN, n):
        return "GOVERNMENT"
    if re.search(ORG_PATTERN, n):
        return "ORGANISATION"
    return "INDIVIDUAL"

def normalize_borough(boro: Any) -> str:
    """Normalizes borough input into standard NYC borough codes '1'..'5'."""
    b = str(boro).strip()
    boro_map = {
        "MANHATTAN": "1",
        "MN": "1",
        "1": "1",
        "BRONX": "2",
        "BX": "2",
        "2": "2",
        "BROOKLYN": "3",
        "BK": "3",
        "3": "3",
        "QUEENS": "4",
        "QN": "4",
        "4": "4",
        "STATEN ISLAND": "5",
        "SI": "5",
        "5": "5"
    }
    return boro_map.get(b.upper(), b)

def parse_date(date_val: Any) -> pd.Timestamp:
    """Robust date parsing for various formats (YYYY-MM-DD, YYYYMMDD, etc.)."""
    try:
        s = str(date_val).strip()
        if len(s) == 8 and s.isdigit():
            return pd.to_datetime(s, format="%Y%m%d")
        return pd.to_datetime(s)
    except Exception:
        return pd.Timestamp.now()

def parse_aggravation_level(agg_val: Any) -> float:
    """Ordinal mapping for aggravation level from Notebook 02 Cell 14."""
    if not agg_val or pd.isna(agg_val):
        return 0.0
    s = str(agg_val).upper().strip()
    if "2" in s or "LEVEL 2" in s:
        return 2.0
    if "1" in s or "LEVEL 1" in s:
        return 1.0
    return 0.0

def extract_dob_unit_and_flag(dob_num: Any):
    """Extracts DOB violation unit code and presence flag from Notebook 02 Cell 14."""
    if not dob_num or pd.isna(dob_num):
        return "NONE", 0
    s = str(dob_num).strip().upper()
    if not s or s == "NAN" or s == "NONE":
        return "NONE", 0
    match = re.search(r'^\d{8}([A-Z]+)', s)
    unit = match.group(1)[:4] if match else "NONE"
    return unit, 1

def get_building_history(bin_val: Any, issue_dt: pd.Timestamp):
    """Extracts building prior violations, prior Class 1 count, and days since previous from Notebook 02 Cell 16."""
    lookup = load_bin_history_lookup()
    if not bin_val or pd.isna(bin_val):
        return 0.0, 0.0, 1000.0, False

    b_str = str(bin_val).split(".")[0].strip()
    # Exclude dummy BINs like 1000000, 2000000, etc. (Notebook 02 Cell 10)
    if re.fullmatch(r'[1-5]000000', b_str) or not b_str:
        return 0.0, 0.0, 1000.0, False

    if b_str in lookup:
        entry = lookup[b_str]
        priors = float(entry.get("total_violations", 0))
        prior_c1 = float(entry.get("total_class1", 0))
        last_date_str = entry.get("last_issue_date")
        if last_date_str and pd.notna(last_date_str):
            try:
                last_dt = pd.to_datetime(last_date_str)
                delta_days = (issue_dt - last_dt).days
                # Days since previous is clipped to [1.0, 1000.0] as in Notebook 02
                days_gap = float(max(1.0, min(1000.0, delta_days))) if delta_days > 0 else 1000.0
            except Exception:
                days_gap = 1000.0
        else:
            days_gap = 1000.0
        return priors, prior_c1, days_gap, True

    return 0.0, 0.0, 1000.0, False

def transform_raw_to_features(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforms raw user / client input into the exact 14 features
    expected by models/buildsafe_final_pipeline.joblib.
    """
    # 1. Clean description
    raw_desc = raw.get("description") or raw.get("VIOLATION_DESCRIPTION") or ""
    desc_clean = clean_description(raw_desc)
    desc_words = float(len(desc_clean.split()))

    # 2. Borough
    raw_boro = raw.get("borough") or raw.get("BORO") or "1"
    boro = normalize_borough(raw_boro)

    # 3. Violation Type
    v_type = str(raw.get("violation_type") or raw.get("VIOLATION_TYPE") or "Unknown").strip()

    # 4. Respondent Name & Type
    resp_name = raw.get("respondent") or raw.get("RESPONDENT_NAME") or ""
    resp_type = get_respondent_type(resp_name)

    # 5. Issue Date & temporal parts
    date_val = raw.get("issue_date") or raw.get("ISSUE_DATE") or "2026-06-01"
    dt = parse_date(date_val)
    issue_month = str(dt.month)
    issue_dow = str(dt.dayofweek)
    is_weekend = 1 if dt.dayofweek >= 5 else 0

    # 6. DOB Violation Unit
    dob_num = raw.get("dob_violation_number") or raw.get("DOB_VIOLATION_NUMBER") or ""
    dob_unit, has_dob = extract_dob_unit_and_flag(dob_num)

    # 7. Aggravation ordinal
    agg_val = raw.get("aggravation_level") or raw.get("AGGRAVATED_LEVEL") or "NO"
    agg_ord = parse_aggravation_level(agg_val)

    # 8. Building history lookup
    bin_val = raw.get("bin") or raw.get("BIN") or ""
    bin_priors, bin_c1, bin_days, bin_found = get_building_history(bin_val, dt)

    return {
        "DESC_CLEAN": desc_clean,
        "BORO": boro,
        "VIOLATION_TYPE": v_type,
        "RESPONDENT_TYPE": resp_type,
        "DOB_UNIT": dob_unit,
        "ISSUE_MONTH": issue_month,
        "ISSUE_DAYOFWEEK": issue_dow,
        "IS_WEEKEND": is_weekend,
        "HAS_DOB_VIOLATION": has_dob,
        "AGGRAVATED_ORD": agg_ord,
        "BIN_PRIOR_VIOLATIONS": bin_priors,
        "BIN_PRIOR_CLASS1": bin_c1,
        "BIN_DAYS_SINCE_PREV": bin_days,
        "DESC_WORDS": desc_words,
        "_meta_bin_found": bin_found,
        "_meta_issue_date": str(dt.date())
    }
