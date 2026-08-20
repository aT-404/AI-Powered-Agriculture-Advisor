"""
Predict Crop Yield
------------------
This script loads the trained Crop Yield Prediction pipeline (GradientBoostingRegressor),
reads input parameters from input.json, validates input features and types (strictly ignoring
Fertilizer, Pesticide, and Production if present), runs inference, and writes the predicted yield to output.json.
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


# Required feature columns (strictly excluding Fertilizer, Pesticide, and Production)
REQUIRED_FEATURES = ["Crop", "Crop_Year", "Season", "State", "Area", "Annual_Rainfall"]
NUMERICAL_FEATURES = ["Crop_Year", "Area", "Annual_Rainfall"]
CATEGORICAL_FEATURES = ["Crop", "Season", "State"]
EXCLUDED_FEATURES = ["fertilizer", "pesticide", "production"]


def resolve_model_path(custom_path: str = None) -> Path:
    """Resolves the path to the trained yield model pipeline."""
    if custom_path:
        p = Path(custom_path)
        if p.exists() and p.is_file():
            return p.resolve()
        raise FileNotFoundError(f"Trained model not found at specified path: {custom_path}")

    script_dir = Path(__file__).resolve().parent
    cwd = Path.cwd()

    candidate_paths = [
        script_dir / "models" / "yield_prediction_model.pkl",
        cwd / "models" / "yield_prediction_model.pkl",
        cwd / "yield model" / "models" / "yield_prediction_model.pkl",
    ]

    for path in candidate_paths:
        if path.exists() and path.is_file():
            return path.resolve()

    raise FileNotFoundError(
        "Trained model 'yield_prediction_model.pkl' not found in 'models/' directory. "
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
        cwd / "yield model" / "input.json",
    ]

    for path in candidate_paths:
        if path.exists() and path.is_file():
            return path.resolve()

    raise FileNotFoundError(
        "Input file 'input.json' not found. "
        "Please provide an 'input.json' file with the required crop and environmental parameters."
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
    """Reads and validates input.json ensuring all required fields are present and valid."""
    try:
        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON syntax in '{input_path}': {e}") from e
    except Exception as e:
        raise ValueError(f"Failed to read input file '{input_path}': {e}") from e

    if not isinstance(data, dict):
        raise ValueError(f"Expected JSON object in '{input_path}', got {type(data).__name__}.")

    # Check for excluded features (Fertilizer, Pesticide, Production) and notify user
    present_excluded = [k for k in data.keys() if k.strip().lower() in EXCLUDED_FEATURES]
    if present_excluded:
        print(f"[!] Notice: '{', '.join(present_excluded)}' provided in input.json will be safely ignored "
              f"as Fertilizer, Pesticide, and Production are excluded from the Yield Prediction model.")

    # Match input keys case-insensitively to standard feature names
    normalized_input = {}
    for key, value in data.items():
        clean_key = key.strip()
        matched = False
        for req in REQUIRED_FEATURES:
            if clean_key.lower() == req.lower():
                normalized_input[req] = value
                matched = True
                break
        if not matched and clean_key.lower() not in EXCLUDED_FEATURES:
            print(f"[!] Warning: Unrecognized field '{key}' in input.json will be ignored.")

    # Validate presence of required features
    missing_fields = [f for f in REQUIRED_FEATURES if f not in normalized_input]
    if missing_fields:
        raise ValueError(
            f"Missing required input field(s): {', '.join(missing_fields)}. "
            f"Required fields are: {', '.join(REQUIRED_FEATURES)}"
        )

    # Validate categorical features
    for cat_col in CATEGORICAL_FEATURES:
        val = normalized_input[cat_col]
        if val is None or not str(val).strip():
            raise ValueError(f"Categorical field '{cat_col}' cannot be null or empty.")
        normalized_input[cat_col] = str(val).strip()

    # Validate numerical features
    for num_col in NUMERICAL_FEATURES:
        val = normalized_input[num_col]
        if val is None:
            raise ValueError(f"Numerical field '{num_col}' cannot be null.")
        try:
            num_val = float(val)
        except (ValueError, TypeError):
            raise ValueError(f"Invalid numeric value for field '{num_col}': received '{val}'")

        if math.isnan(num_val) or math.isinf(num_val):
            raise ValueError(f"Field '{num_col}' has invalid numeric value: {num_val}")

        if num_col == "Crop_Year":
            normalized_input[num_col] = int(num_val)
        else:
            normalized_input[num_col] = num_val

    return normalized_input


def predict_yield(pipeline, input_features: dict) -> dict:
    """Formats features in exact order, applies preprocessing pipeline, and predicts yield."""
    # Create single-row DataFrame in the exact feature order
    feature_df = pd.DataFrame([[input_features[f] for f in REQUIRED_FEATURES]], columns=REQUIRED_FEATURES)

    # Predict yield using the GradientBoostingRegressor pipeline
    predicted_val = pipeline.predict(feature_df)[0]

    # Non-negative yield constraint
    predicted_yield = max(0.0, float(predicted_val))

    result = {
        "predicted_yield": round(predicted_yield, 2),
    }

    return result


def main():
    parser = argparse.ArgumentParser(description="Predict Crop Yield from input.json")
    parser.add_argument("--model", type=str, default=None, help="Path to trained model .pkl")
    parser.add_argument("--input", type=str, default=None, help="Path to input.json")
    parser.add_argument("--output", type=str, default=None, help="Path to output.json")
    args = parser.parse_args()

    try:
        model_path = resolve_model_path(args.model)
        input_path = resolve_input_path(args.input)
        output_path = resolve_output_path(args.output, input_path)

        print(f"[+] Loading trained model pipeline from: {model_path}")
        pipeline = joblib.load(model_path)

        print(f"[+] Reading input data from: {input_path}")
        input_features = load_and_validate_input(input_path)

        print(f"[+] Cleaned input features: {input_features}")
        print("[+] Performing yield prediction...")
        prediction_result = predict_yield(pipeline, input_features)

        # Save to output.json
        print(f"[+] Writing prediction result to: {output_path}")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(prediction_result, f, indent=4)

        print("=" * 50)
        print(" Crop Yield Prediction Result:")
        print(f"  Predicted Yield : {prediction_result.get('predicted_yield')}")
        print("=" * 50)
        print("[SUCCESS] Prediction completed successfully!")

    except Exception as e:
        print(f"\n[ERROR] Prediction failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
