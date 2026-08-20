"""
Yield Prediction Model Bridge
==============================
Reads from ai_model/yield_prediction/output.json — the file written by the
ML team after running ai_model/yield_prediction/predict.py.

CONTRACT (ai_model/yield_prediction/output.json):
{
  "predicted_yield": 4.21,
  "unit": "tons/hectare",
  "crop_type": "Rice"
}

YIELD MODEL INPUT CONTRACT (from ai_model/yield_prediction/input.json):
{
  "N": 80, "P": 40, "K": 45,
  "Soil_pH": 6.5, "Soil_Moisture": 35, "Soil_Type": "Loamy",
  "Organic_Carbon": 1.8, "Temperature": 27, "Humidity": 75,
  "Rainfall": 900, "Sunlight_Hours": 8, "Wind_Speed": 12,
  "Region": "South", "Altitude": 100, "Season": "Kharif",
  "Crop_Type": "Rice", "Irrigation_Type": "Drip",
  "Fertilizer_Used": "Yes", "Pesticide_Used": "No"
}

TODO (ML team):
  - Run ai_model/yield_prediction/train.py to generate:
      ai_model/yield_prediction/models/best_yield_model.pkl
      ai_model/yield_prediction/models/yield_label_encoders.pkl
      ai_model/yield_prediction/models/yield_features.pkl
  - Run ai_model/yield_prediction/predict.py with the desired input
  - Write the result to ai_model/yield_prediction/output.json
"""

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

YIELD_OUTPUT_PATH = (
    Path(__file__).resolve().parent.parent.parent
    / "ai_model" / "yield_prediction" / "output.json"
)


class YieldModelUnavailable(Exception):
    """Raised when the yield model output.json cannot be read."""
    pass


def predict_yield(input_data: dict) -> dict | None:
    """
    Read yield prediction result from ai_model/yield_prediction/output.json.

    Returns None (gracefully) if the output file is not present — the crop
    prediction will still succeed without yield data.

    Args:
        input_data: dict with the 19-field yield model input contract
                    (see module docstring)

    Returns:
        {
            "predicted_yield": float,
            "unit": str,          # e.g. "tons/hectare"
            "crop_type": str | None
        }
        or None if output.json is unavailable.
    """
    if not YIELD_OUTPUT_PATH.exists():
        logger.warning(
            "Yield model output not found at %s. "
            "Yield prediction will be skipped. "
            "ML team must run yield_prediction/predict.py first.",
            YIELD_OUTPUT_PATH,
        )
        return None

    try:
        with open(YIELD_OUTPUT_PATH, "r", encoding="utf-8") as f:
            raw = json.load(f)
    except (json.JSONDecodeError, OSError) as exc:
        logger.error("Failed to read yield output.json: %s", exc)
        return None

    predicted_yield = raw.get("predicted_yield")
    if predicted_yield is None:
        logger.error("yield output.json missing 'predicted_yield' field.")
        return None

    return {
        "predicted_yield": float(predicted_yield),
        "unit": str(raw.get("unit", "tons/hectare")),
        "crop_type": raw.get("crop_type"),
    }
