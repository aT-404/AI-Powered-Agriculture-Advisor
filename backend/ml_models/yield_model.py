"""
Yield Prediction Model Bridge
==============================
Executes the machine learning model in `ai_model/yield_prediction/predict.py`
by mapping input parameters to the expected 6 features, writing them to input.json,
running predict.py, and reading the output from output.json.
"""

import json
import logging
import subprocess
import sys
from pathlib import Path

logger = logging.getLogger(__name__)

# Absolute paths to the model directory files
BASE_DIR = Path(__file__).resolve().parent.parent.parent
AI_MODEL_DIR = BASE_DIR / "ai_model" / "yield_prediction"
PREDICT_SCRIPT = AI_MODEL_DIR / "predict.py"
INPUT_PATH = AI_MODEL_DIR / "input.json"
OUTPUT_PATH = AI_MODEL_DIR / "output.json"


class YieldModelUnavailable(Exception):
    """Raised when the yield model execution or reading fails."""
    pass


def predict_yield(input_data: dict) -> dict | None:
    """
    Run yield prediction ML model by preparing the 6 required features:
    Crop, Crop_Year, Season, State, Area, Annual_Rainfall.

    Args:
        input_data: dict containing either the old 19 features or the new 6 features.

    Returns:
        {
            "predicted_yield": float,
            "unit": str,
            "crop_type": str | None
        }
        or None if output.json is unavailable or execution fails.
    """
    if not PREDICT_SCRIPT.exists():
        logger.warning("Yield model prediction script not found at: %s", PREDICT_SCRIPT)
        return None

    try:
        # Flexible mapping to support both 6-parameter and 19-parameter inputs
        crop = input_data.get("Crop") or input_data.get("Crop_Type") or "Rice"
        crop_year = input_data.get("Crop_Year") or 2026
        season = input_data.get("Season") or "Kharif"
        
        # Map Region (e.g. South) to State, default to Kerala
        state = input_data.get("State") or input_data.get("Region") or "Kerala"
        if state in ["South", "North", "East", "West", "Central"]:
            # Region to state mapping fallbacks
            region_map = {
                "South": "Kerala",
                "North": "Punjab",
                "East": "West Bengal",
                "West": "Maharashtra",
                "Central": "Madhya Pradesh"
            }
            state = region_map.get(state, "Kerala")

        area = input_data.get("Area") or 10.0
        
        # Rainfall / Annual Rainfall mapping
        rainfall = input_data.get("Annual_Rainfall") or input_data.get("Rainfall") or 1200.0

        # Construct input payload
        input_payload = {
            "Crop": str(crop).strip().title(),
            "Crop_Year": int(float(crop_year)),
            "Season": str(season).strip(),
            "State": str(state).strip().title(),
            "Area": float(area),
            "Annual_Rainfall": float(rainfall)
        }

        # Write to input.json
        with open(INPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(input_payload, f, indent=4)

        # Execute predict.py via subprocess using current Python environment interpreter
        logger.info("Executing yield prediction ML model via subprocess...")
        result = subprocess.run(
            [sys.executable, str(PREDICT_SCRIPT), "--input", str(INPUT_PATH), "--output", str(OUTPUT_PATH)],
            capture_output=True,
            text=True,
            check=True
        )
    except subprocess.CalledProcessError as exc:
        logger.error("Yield model execution failed: %s", exc.stderr)
        return None
    except Exception as exc:
        logger.error("Failed to prepare inputs or execute yield model: %s", exc)
        return None

    if not OUTPUT_PATH.exists():
        logger.warning("Yield model output.json was not generated at: %s", OUTPUT_PATH)
        return None

    try:
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            raw = json.load(f)
    except (json.JSONDecodeError, OSError) as exc:
        logger.error("Failed to read yield output.json: %s", exc)
        return None

    predicted_yield = raw.get("predicted_yield")
    if predicted_yield is None:
        logger.error("Yield output.json missing 'predicted_yield' field.")
        return None

    return {
        "predicted_yield": float(predicted_yield),
        "unit": str(raw.get("unit", "tons/hectare")),
        "crop_type": str(crop).strip().title(),
    }
