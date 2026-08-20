"""
Train Crop Recommendation Model
--------------------------------
This script loads the crop recommendation dataset, validates features and target,
trains a RandomForestClassifier, evaluates performance, and saves the trained model
and feature metadata to the models/ directory.
"""

import os
import sys
import json
import argparse
from pathlib import Path
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# Expected feature columns and target column
EXPECTED_FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
TARGET_COLUMN = "label"


def resolve_dataset_path(custom_path: str = None) -> Path:
    """Finds and resolves the dataset path across common locations."""
    if custom_path:
        p = Path(custom_path)
        if p.exists() and p.is_file():
            return p.resolve()
        raise FileNotFoundError(f"Specified dataset file not found: {custom_path}")

    script_dir = Path(__file__).resolve().parent
    cwd = Path.cwd()

    candidate_relative_paths = [
        Path("crop recomentation dataset") / "Crop_recommendation.csv",
        Path("crop recomentation dataset") / "crop_recommendation.csv",
        Path("data") / "Crop_recommendation.csv",
        Path("data") / "crop_recommendation.csv",
        Path("Crop_recommendation.csv"),
        Path("crop_recommendation.csv"),
    ]

    search_roots = [script_dir, cwd, script_dir.parent]

    for root in search_roots:
        for rel_path in candidate_relative_paths:
            candidate = (root / rel_path).resolve()
            if candidate.exists() and candidate.is_file():
                return candidate

    raise FileNotFoundError(
        "Crop recommendation dataset could not be located. "
        "Please ensure 'Crop_recommendation.csv' exists in 'crop recomentation dataset/' or provide --data path."
    )


def load_and_validate_dataset(dataset_path: Path) -> pd.DataFrame:
    """Loads CSV dataset and validates required columns and data integrity."""
    print(f"[+] Loading dataset from: {dataset_path}")
    try:
        df = pd.read_csv(dataset_path)
    except Exception as e:
        raise ValueError(f"Failed to read CSV dataset: {e}") from e

    if df.empty:
        raise ValueError("Dataset is empty.")

    # Validate column presence
    missing_features = [col for col in EXPECTED_FEATURES if col not in df.columns]
    if missing_features:
        raise ValueError(f"Dataset is missing required feature column(s): {missing_features}")

    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Dataset is missing target column: '{TARGET_COLUMN}'")

    # Check for null values
    null_counts = df[EXPECTED_FEATURES + [TARGET_COLUMN]].isnull().sum()
    if null_counts.any():
        print(f"[!] Warning: Missing values detected:\n{null_counts[null_counts > 0]}")
        print("[!] Dropping rows with missing values...")
        df = df.dropna(subset=EXPECTED_FEATURES + [TARGET_COLUMN])

    # Validate numeric types for features
    for col in EXPECTED_FEATURES:
        if not pd.api.types.is_numeric_dtype(df[col]):
            try:
                df[col] = pd.to_numeric(df[col])
            except Exception as e:
                raise ValueError(f"Feature '{col}' contains non-numeric values that could not be converted: {e}")

    print(f"[+] Dataset successfully loaded. Total samples: {len(df)}, Features: {len(EXPECTED_FEATURES)}")
    return df


def train_and_evaluate(df: pd.DataFrame, random_state: int = 42):
    """Splits data, trains RandomForestClassifier, and outputs evaluation metrics."""
    X = df[EXPECTED_FEATURES]
    y = df[TARGET_COLUMN]

    print("[+] Splitting dataset into train and test sets (test_size=0.2, random_state=42)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=random_state, stratify=y
    )

    print("[+] Training RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=random_state)
    model.fit(X_train, y_train)

    print("[+] Evaluating model on test set...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, zero_division=0)

    print("=" * 60)
    print(f" Model Accuracy: {accuracy * 100:.2f}%")
    print("=" * 60)
    print("Classification Report:")
    print(report)
    print("=" * 60)

    return model, accuracy


def save_artifacts(model, accuracy: float, output_dir: Path):
    """Saves the trained model and feature metadata."""
    output_dir.mkdir(parents=True, exist_ok=True)

    model_path = output_dir / "crop_recommendation_model.pkl"
    metadata_path = output_dir / "model_metadata.json"

    print(f"[+] Saving model to: {model_path}")
    joblib.dump(model, model_path)

    metadata = {
        "model_type": "RandomForestClassifier",
        "features": EXPECTED_FEATURES,
        "target": TARGET_COLUMN,
        "classes": sorted(list(model.classes_)),
        "accuracy": round(float(accuracy), 4),
        "random_state": 42,
    }

    print(f"[+] Saving model metadata to: {metadata_path}")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)

    print("[SUCCESS] Model training and export completed successfully!")


def main():
    parser = argparse.ArgumentParser(description="Train Crop Recommendation Random Forest Model")
    parser.add_argument("--data", type=str, default=None, help="Path to Crop_recommendation.csv dataset")
    parser.add_argument("--output-dir", type=str, default=None, help="Directory to save the trained model")
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    models_dir = Path(args.output_dir) if args.output_dir else (script_dir / "models")

    try:
        dataset_path = resolve_dataset_path(args.data)
        df = load_and_validate_dataset(dataset_path)
        model, accuracy = train_and_evaluate(df, random_state=42)
        save_artifacts(model, accuracy, models_dir)
    except Exception as e:
        print(f"\n[ERROR] Training failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
