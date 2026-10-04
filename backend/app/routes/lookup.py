from fastapi import APIRouter, HTTPException
from typing import Optional
from pathlib import Path
import pandas as pd

from ..preprocessor import load_bin_history_lookup
from ..schemas import BuildingHistoryResponse

router = APIRouter(prefix="/api/lookup", tags=["Lookup & Presets"])

@router.get("/bin/{bin_id}", response_model=BuildingHistoryResponse)
def lookup_bin(bin_id: str):
    """
    Looks up building violation history for a given 7-digit BIN.
    Returns total past violations, Class 1 violations count, and last violation date.
    """
    clean_bin = str(bin_id).strip().split(".")[0]
    lookup = load_bin_history_lookup()
    
    if clean_bin in lookup:
        entry = lookup[clean_bin]
        return {
            "bin": clean_bin,
            "exists": True,
            "total_violations": int(entry.get("total_violations", 0)),
            "total_class1": int(entry.get("total_class1", 0)),
            "last_issue_date": str(entry.get("last_issue_date")),
            "days_since_prev_estimate": None
        }
    
    return {
        "bin": clean_bin,
        "exists": False,
        "total_violations": 0,
        "total_class1": 0,
        "last_issue_date": None,
        "days_since_prev_estimate": 1000.0
    }

@router.get("/metadata")
def get_metadata():
    """
    Returns dropdown choices and pre-filled scenario presets for intuitive frontend testing.
    """
    boroughs = [
        {"code": "1", "name": "Manhattan"},
        {"code": "2", "name": "Bronx"},
        {"code": "3", "name": "Brooklyn"},
        {"code": "4", "name": "Queens"},
        {"code": "5", "name": "Staten Island"}
    ]

    violation_types = [
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
    ]

    aggravation_levels = [
        {"value": "NO", "label": "No Aggravation (Standard)"},
        {"value": "AGGRAVATED OFFENSE LEVEL 1", "label": "Aggravated Offense Level 1"},
        {"value": "AGGRAVATED OFFENSE LEVEL 2", "label": "Aggravated Offense Level 2 (Severe Repeat Offender)"}
    ]

    presets = [
        {
            "id": "preset_class1_hazard",
            "title": "Severe Structural Hazard (Class 1)",
            "subtitle": "Unlawful structural demolition without shoring; immediate hazard",
            "expected_class": "CLASS - 1",
            "data": {
                "description": "UNLAWFUL ACTS. FAILURE TO COMPLY WITH COMMISSIONER'S ORDER. FAILURE TO MAINTAIN BUILDING STABILITY DURING DEMOLITION WORK. CRACKING AND BULGING OBSERVED ON EXTERIOR BEARING WALL. CEASE USE AND PROVIDE IMMEDIATE SHORING.",
                "borough": "1",
                "violation_type": "Construction",
                "respondent": "METROPOLITAN BUILDERS CORP",
                "issue_date": "2026-06-18",
                "aggravation_level": "AGGRAVATED OFFENSE LEVEL 1",
                "bin": "1000007",
                "dob_violation_number": "39162126CUPK01"
            }
        },
        {
            "id": "preset_class2_major",
            "title": "Illegal Occupancy & Work Without Permit (Class 2)",
            "subtitle": "Residential basement converted to commercial spa; standard permit lapse",
            "expected_class": "CLASS - 2",
            "data": {
                "description": "WORK WITHOUT A PERMIT. NOTED RESIDENTIAL 2ND FLOOR APARTMENT CONVERTED INTO COMMERCIAL SPA BUSINESS MABEL SPA LLC WITH NEW PARTITIONS AND PLUMBING FIXTURES WITHOUT VALID DOB APPROVAL.",
                "borough": "2",
                "violation_type": "Construction",
                "respondent": "ZAPATA NEPTALI",
                "issue_date": "2026-06-01",
                "aggravation_level": "NO",
                "bin": "2026562",
                "dob_violation_number": ""
            }
        },
        {
            "id": "preset_class3_lesser",
            "title": "Expired Signage & Minor Non-Hazard (Class 3)",
            "subtitle": "Outdoor commercial advertising sign without certificate on file",
            "expected_class": "CLASS - 3",
            "data": {
                "description": "OUTDOOR ADVERTISING SIGN DISPLAYED WITHOUT VALID CERTIFICATE OF REGISTRATION. MAINTAINING ILLUMINATED SIGN EXCEEDING ALLOWABLE SQUARE FOOTAGE ON ROOF. FILE CERTIFICATE AND ALL PERMITS WITH COMMISSIONER.",
                "borough": "4",
                "violation_type": "Signs",
                "respondent": "CLEAR CHANNEL OUTDOOR INC",
                "issue_date": "2026-05-20",
                "aggravation_level": "NO",
                "bin": "4001234",
                "dob_violation_number": ""
            }
        },
        {
            "id": "preset_human_review",
            "title": "Borderline Triage (Triggers Human Review Flag)",
            "subtitle": "Conflicting structural defect signals; confidence 54.2% < 65% threshold",
            "expected_class": "Needs Human Review (Flagged)",
            "data": {
                "description": "FAILURE TO MAINTAIN EXTERIOR BUILDING WALL REPAIR CRACK",
                "borough": "1",
                "violation_type": "Construction",
                "respondent": "NYC HOUSING AUTHORITY",
                "issue_date": "2026-06-15",
                "aggravation_level": "NO",
                "bin": "1000007",
                "dob_violation_number": ""
            }
        }
    ]

    return {
        "boroughs": boroughs,
        "violation_types": violation_types,
        "aggravation_levels": aggravation_levels,
        "presets": presets
    }
