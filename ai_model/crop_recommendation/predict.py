"""
Predict Crop Recommendation
---------------------------
This script loads the trained Crop Recommendation model, reads input values
from input.json, validates fields and numeric values, performs inference,
and writes the predicted crop and confidence score to output.json.
"""

import os
import sys
import json
import math
import argparse
from pathlib import Path
import joblib
import pandas as pd
import numpy as np


REQUIRED_FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]


def resolve_model_path(custom_path: str = None) -> Path:
    """Resolves the path to the trained model file."""
    if custom_path:
        p = Path(custom_path)
        if p.exists() and p.is_file():
            return p.resolve()
        raise FileNotFoundError(f"Trained model not found at specified path: {custom_path}")

    script_dir = Path(__file__).resolve().parent
    cwd = Path.cwd()

    candidate_paths = [
        script_dir / "models" / "crop_recommendation_model.pkl",
        cwd / "models" / "crop_recommendation_model.pkl",
        cwd / "crop-rec model" / "models" / "crop_recommendation_model.pkl",
    ]

    for path in candidate_paths:
        if path.exists() and path.is_file():
            return path.resolve()

    raise FileNotFoundError(
        "Trained model 'crop_recommendation_model.pkl' not found in 'models/' directory. "
        "Please train the model first by running 'python train.py'."
    )


def resolve_input_path(custom_path: str = None) -> Path:
    """Resolves the path to input.json."""
    if custom_path:
        p = Path(custom_path)
        if p.exists() and p.is_file():
            return p.resolve()
        raise FileNotFoundError(f"Input file not found at specified path: {custom_path}")

    cwd = Path.cwd()
    script_dir = Path(__file__).resolve().parent

    candidate_paths = [
        cwd / "input.json",
        script_dir / "input.json",
        cwd / "crop-rec model" / "input.json",
    ]

    for path in candidate_paths:
        if path.exists() and path.is_file():
            return path.resolve()

    raise FileNotFoundError(
        "Input file 'input.json' not found. "
        "Please provide an 'input.json' file with the required soil and climate parameters."
    )


def resolve_output_path(custom_path: str = None, input_path: Path = None) -> Path:
    """Determines where to save output.json."""
    if custom_path:
        return Path(custom_path).resolve()

    if input_path and input_path.parent.exists():
        return (input_path.parent / "output.json").resolve()

    script_dir = Path(__file__).resolve().parent
    return (script_dir / "output.json").resolve()


def load_and_validate_input(input_path: Path) -> dict:
    """Reads input.json and validates JSON structure and required fields."""
    try:
        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON syntax in '{input_path}': {e}") from e
    except Exception as e:
        raise ValueError(f"Failed to read input file '{input_path}': {e}") from e

    if not isinstance(data, dict):
        raise ValueError(f"Expected JSON object in '{input_path}', got {type(data).__name__}.")

    # Validate presence of required fields
    missing_fields = [f for f in REQUIRED_FEATURES if f not in data]
    if missing_fields:
        raise ValueError(
            f"Missing required input field(s): {', '.join(missing_fields)}. "
            f"Required fields are: {', '.join(REQUIRED_FEATURES)}"
        )

    # Validate numeric values
    validated_values = {}
    for feature in REQUIRED_FEATURES:
        val = data[feature]
        if val is None:
            raise ValueError(f"Value for field '{feature}' cannot be null.")
        
        try:
            numeric_val = float(val)
        except (ValueError, TypeError):
            raise ValueError(f"Invalid numeric value for field '{feature}': received '{val}'")

        if math.isnan(numeric_val) or math.isinf(numeric_val):
            raise ValueError(f"Field '{feature}' has invalid numeric value: {numeric_val}")

        validated_values[feature] = numeric_val

    return validated_values


def predict(model, input_features: dict) -> dict:
    """Formats features in exact order, runs inference, and computes confidence."""
    # Ensure correct feature ordering: N, P, K, temperature, humidity, ph, rainfall
    feature_df = pd.DataFrame([[input_features[f] for f in REQUIRED_FEATURES]], columns=REQUIRED_FEATURES)

    # Predict crop class
    predicted_crop = model.predict(feature_df)[0]

    # Calculate prediction confidence if predict_proba is available
    confidence = None
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(feature_df)[0]
        max_prob = float(np.max(probabilities))
        confidence = round(max_prob, 2)

    result = {
        "predicted_crop": str(predicted_crop),
    }
    if confidence is not None:
        result["confidence"] = confidence

    return result


def main():
    parser = argparse.ArgumentParser(description="Predict Crop Recommendation from input.json")
    parser.add_argument("--model", type=str, default=None, help="Path to trained model .pkl")
    parser.add_argument("--input", type=str, default=None, help="Path to input.json")
    parser.add_argument("--output", type=str, default=None, help="Path to output.json")
    args = parser.parse_args()

    try:
        model_path = resolve_model_path(args.model)
        input_path = resolve_input_path(args.input)
        output_path = resolve_output_path(args.output, input_path)

        print(f"[+] Loading trained model from: {model_path}")
        model = joblib.load(model_path)

        print(f"[+] Reading input data from: {input_path}")
        input_features = load_and_validate_input(input_path)

        print(f"[+] Input parameters: {input_features}")
        print("[+] Performing prediction...")
        prediction_result = predict(model, input_features)

        # Save to output.json
        print(f"[+] Writing prediction result to: {output_path}")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(prediction_result, f, indent=4)

        print("=" * 50)
        print(" Prediction Result:")
        print(f"  Recommended Crop : {prediction_result.get('predicted_crop')}")
        if "confidence" in prediction_result:
            print(f"  Confidence       : {prediction_result.get('confidence') * 100:.1f}%")
        print("=" * 50)
        print("[SUCCESS] Prediction completed successfully!")

    except Exception as e:
        print(f"\n[ERROR] Prediction failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
