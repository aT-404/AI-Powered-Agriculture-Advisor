"""
Crop Prediction Model Bridge
=============================
Reads from ai_model/model/output.json — the file written by the ML team
after running ai_model/predict.py.

CONTRACT (ai_model/model/output.json):
{
  "recommended_crop": "rice",
  "confidence": 0.9132,
  "top_recommendations": [
    {"crop": "rice", "confidence": 0.9132},
    {"crop": "maize", "confidence": 0.0521},
    {"crop": "wheat", "confidence": 0.0347}
  ]
}
"""

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Path to the output.json written by the ML model script
CROP_OUTPUT_PATH = Path(__file__).resolve().parent.parent.parent / "ai_model" / "model" / "output.json"


class CropModelUnavailable(Exception):
    """Raised when the crop model output.json cannot be read."""
    pass


def predict_best_crop(input_data: dict) -> dict:
    """
    Read crop prediction result from ai_model/model/output.json.

    The ML team runs ai_model/predict.py with soil/climate inputs and writes
    the result to output.json. This function reads and normalizes that output.

    Args:
        input_data: dict with keys N, P, K, temperature, humidity, ph, rainfall
                    (passed for logging/context — actual prediction is pre-computed)

    Returns:
        {
            "recommended_crop": str,
            "confidence": float | None,
            "top_recommendations": list[{"crop": str, "confidence": float}]
        }

    Raises:
        CropModelUnavailable: if output.json is missing or malformed
    """
    if not CROP_OUTPUT_PATH.exists():
        raise CropModelUnavailable(
            f"Crop model output not found at: {CROP_OUTPUT_PATH}\n"
            "The ML team must run ai_model/predict.py first to generate output.json."
        )

    try:
        with open(CROP_OUTPUT_PATH, "r", encoding="utf-8") as f:
            raw = json.load(f)
    except (json.JSONDecodeError, OSError) as exc:
        raise CropModelUnavailable(f"Failed to read crop output.json: {exc}") from exc

    # Normalize to a consistent contract
    recommended_crop = raw.get("recommended_crop") or raw.get("crop")
    if not recommended_crop:
        raise CropModelUnavailable("output.json missing 'recommended_crop' field.")

    return {
        "recommended_crop": str(recommended_crop).strip().title(),
        "confidence": raw.get("confidence"),
        "top_recommendations": raw.get("top_recommendations", []),
    }
