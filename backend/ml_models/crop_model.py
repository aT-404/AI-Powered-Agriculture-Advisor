"""
Crop Prediction Model Bridge
=============================
Executes the machine learning model in `ai_model/crop_recommendation/predict.py`
by passing input values via input.json and reading the result from output.json.
"""

import json
import logging
import subprocess
import sys
from pathlib import Path

logger = logging.getLogger(__name__)

# Absolute paths to the model directory files
BASE_DIR = Path(__file__).resolve().parent.parent.parent
AI_MODEL_DIR = BASE_DIR / "ai_model" / "crop_recommendation"
PREDICT_SCRIPT = AI_MODEL_DIR / "predict.py"
INPUT_PATH = AI_MODEL_DIR / "input.json"
OUTPUT_PATH = AI_MODEL_DIR / "output.json"


class CropModelUnavailable(Exception):
    """Raised when the crop model execution or reading fails."""
    pass


def predict_best_crop(input_data: dict) -> dict:
    """
    Run crop prediction ML model by writing inputs to input.json,
    executing predict.py, and reading the generated output.json.

    Args:
        input_data: dict with keys N, P, K, temperature, humidity, ph, rainfall

    Returns:
        {
            "recommended_crop": str,
            "confidence": float | None,
            "top_recommendations": list[{"crop": str, "confidence": float}]
        }
    """
    if not PREDICT_SCRIPT.exists():
        raise CropModelUnavailable(f"Crop model prediction script not found at: {PREDICT_SCRIPT}")

    try:
        # Prepare inputs exactly as expected by REQUIRED_FEATURES
        input_payload = {
            "N": float(input_data["N"]),
            "P": float(input_data["P"]),
            "K": float(input_data["K"]),
            "temperature": float(input_data["temperature"]),
            "humidity": float(input_data["humidity"]),
            "ph": float(input_data["ph"]),
            "rainfall": float(input_data["rainfall"])
        }

        # Write to input.json
        with open(INPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(input_payload, f, indent=4)

        # Execute predict.py via subprocess using current Python environment interpreter
        logger.info("Executing crop recommendation ML model via subprocess...")
        result = subprocess.run(
            [sys.executable, str(PREDICT_SCRIPT), "--input", str(INPUT_PATH), "--output", str(OUTPUT_PATH)],
            capture_output=True,
            text=True,
            check=True
        )
    except subprocess.CalledProcessError as exc:
        logger.error("Crop model execution failed: %s", exc.stderr)
        raise CropModelUnavailable(f"ML execution failed: {exc.stderr.strip() or exc.stdout.strip()}") from exc
    except Exception as exc:
        logger.error("Failed to prepare inputs or execute crop model: %s", exc)
        raise CropModelUnavailable(f"Failed to execute model: {exc}") from exc

    if not OUTPUT_PATH.exists():
        raise CropModelUnavailable(f"Crop model output.json was not generated at: {OUTPUT_PATH}")

    try:
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            raw = json.load(f)
    except (json.JSONDecodeError, OSError) as exc:
        raise CropModelUnavailable(f"Failed to read crop output.json: {exc}") from exc

    recommended_crop = raw.get("predicted_crop")
    if not recommended_crop:
        raise CropModelUnavailable("output.json missing 'predicted_crop' field.")

    confidence = raw.get("confidence")
    top_recommendations = [{"crop": str(recommended_crop).strip().title(), "confidence": confidence}] if confidence else []

    return {
        "recommended_crop": str(recommended_crop).strip().title(),
        "confidence": confidence,
        "top_recommendations": raw.get("top_recommendations", top_recommendations),
    }
