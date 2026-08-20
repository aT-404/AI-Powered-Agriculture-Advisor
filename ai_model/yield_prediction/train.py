"""
Train Crop Yield Prediction Model
---------------------------------
This script loads the crop yield dataset, removes Fertilizer, Pesticide, and Production columns,
builds a preprocessing and GradientBoostingRegressor pipeline, evaluates regression
metrics (R2, MAE, MSE, RMSE), and saves the trained model pipeline and metadata.
"""

import os
import sys
import json
import argparse
from pathlib import Path
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, root_mean_squared_error


# Target column and columns to exclude
TARGET_COLUMN = "Yield"
EXCLUDE_COLUMNS = ["fertilizer", "pesticide", "production"]


def resolve_dataset_path(custom_path: str = None) -> Path:
    """Finds and resolves the yield dataset path across standard locations."""
    if custom_path:
        p = Path(custom_path)
        if p.exists() and p.is_file():
            return p.resolve()
        raise FileNotFoundError(f"Specified dataset file not found: {custom_path}")

    script_dir = Path(__file__).resolve().parent
    cwd = Path.cwd()

    candidate_relative_paths = [
        Path("yield dataset") / "crop_yield.csv",
        Path("yield dataset") / "Crop_yield.csv",
        Path("data") / "crop_yield.csv",
        Path("data") / "yield_dataset.csv",
        Path("crop_yield.csv"),
        Path("yield_dataset.csv"),
    ]

    search_roots = [script_dir, cwd, script_dir.parent]

    for root in search_roots:
        for rel_path in candidate_relative_paths:
            candidate = (root / rel_path).resolve()
            if candidate.exists() and candidate.is_file():
                return candidate

    raise FileNotFoundError(
        "Crop yield dataset could not be located. "
        "Please ensure 'crop_yield.csv' exists in 'yield dataset/' or provide --data path."
    )


def load_and_preprocess_dataset(dataset_path: Path):
    """Loads CSV, validates columns, safely removes Fertilizer, Pesticide, and Production, and cleans data."""
    print(f"[+] Loading dataset from: {dataset_path}")
    try:
        df = pd.read_csv(dataset_path)
    except Exception as e:
        raise ValueError(f"Failed to read CSV dataset: {e}") from e

    if df.empty:
        raise ValueError("Dataset is empty.")

    print(f"[+] Original dataset shape: {df.shape}")
    print(f"[+] Original columns: {df.columns.tolist()}")

    # Find target column case-insensitively
    target_match = None
    for col in df.columns:
        if col.strip().lower() == TARGET_COLUMN.lower():
            target_match = col
            break

    if not target_match:
        raise ValueError(f"Required target column '{TARGET_COLUMN}' not found in dataset.")

    if target_match != TARGET_COLUMN:
        df = df.rename(columns={target_match: TARGET_COLUMN})

    # Safely identify and drop Fertilizer, Pesticide, and Production columns
    dropped_cols = []
    for col in df.columns:
        if col.strip().lower() in EXCLUDE_COLUMNS:
            dropped_cols.append(col)

    if dropped_cols:
        print(f"[+] Safely removing excluded columns: {dropped_cols}")
        df = df.drop(columns=dropped_cols)
    else:
        print("[!] Note: No excluded columns were found in dataset.")

    # Strip whitespace from string/categorical columns
    str_cols = df.select_dtypes(include=["object", "string"]).columns
    for col in str_cols:
        df[col] = df[col].astype(str).str.strip()

    # Drop null values if any
    null_count = df.isnull().sum().sum()
    if null_count > 0:
        print(f"[!] Warning: Found {null_count} missing values. Dropping incomplete rows...")
        df = df.dropna()

    # Identify feature columns (all columns except Yield)
    feature_columns = [col for col in df.columns if col != TARGET_COLUMN]

    # Classify categorical vs numerical feature columns
    cat_features = [col for col in feature_columns if not pd.api.types.is_numeric_dtype(df[col])]
    num_features = [col for col in feature_columns if col not in cat_features]

    print(f"[+] Target column: '{TARGET_COLUMN}'")
    print(f"[+] Feature columns ({len(feature_columns)}): {feature_columns}")
    print(f"    - Categorical features ({len(cat_features)}): {cat_features}")
    print(f"    - Numerical features ({len(num_features)}): {num_features}")

    return df, feature_columns, cat_features, num_features


def train_and_evaluate(df: pd.DataFrame, feature_columns: list, cat_features: list, num_features: list, random_state: int = 42):
    """Builds preprocessing + GradientBoostingRegressor pipeline, trains, and evaluates."""
    X = df[feature_columns]
    y = df[TARGET_COLUMN]

    print(f"[+] Splitting dataset into train/test sets (test_size=0.2, random_state={random_state})...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=random_state
    )

    print("[+] Constructing preprocessing and GradientBoostingRegressor pipeline...")
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_features),
            ("num", StandardScaler(), num_features),
        ],
        remainder="passthrough",
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", GradientBoostingRegressor(random_state=random_state)),
        ]
    )

    print("[+] Training GradientBoostingRegressor model...")
    pipeline.fit(X_train, y_train)

    print("[+] Evaluating model on test set...")
    y_pred = pipeline.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = root_mean_squared_error(y_test, y_pred)

    print("=" * 60)
    print(" Crop Yield Prediction - Model Evaluation Metrics")
    print("=" * 60)
    print(f" Model Algorithm           : GradientBoostingRegressor")
    print(f" R^2 Score (Coefficient)   : {r2:.4f}")
    print(f" Mean Absolute Error (MAE) : {mae:.4f}")
    print(f" Mean Squared Error (MSE)  : {mse:.4f}")
    print(f" Root Mean Squared Error   : {rmse:.4f}")
    print("=" * 60)

    metrics = {
        "r2_score": round(float(r2), 4),
        "mae": round(float(mae), 4),
        "mse": round(float(mse), 4),
        "rmse": round(float(rmse), 4),
    }

    return pipeline, metrics


def save_artifacts(pipeline: Pipeline, feature_columns: list, cat_features: list, num_features: list, metrics: dict, output_dir: Path):
    """Saves the trained pipeline and metadata."""
    output_dir.mkdir(parents=True, exist_ok=True)

    model_path = output_dir / "yield_prediction_model.pkl"
    metadata_path = output_dir / "model_metadata.json"

    print(f"[+] Saving model pipeline to: {model_path}")
    joblib.dump(pipeline, model_path)

    metadata = {
        "model_type": "GradientBoostingRegressor",
        "target": TARGET_COLUMN,
        "features": feature_columns,
        "categorical_features": cat_features,
        "numerical_features": num_features,
        "excluded_features": ["Fertilizer", "Pesticide", "Production"],
        "metrics": metrics,
        "random_state": 42,
    }

    print(f"[+] Saving model metadata to: {metadata_path}")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)

    print("[SUCCESS] Model training and export completed successfully!")


def main():
    parser = argparse.ArgumentParser(description="Train Crop Yield Prediction GradientBoostingRegressor Model")
    parser.add_argument("--data", type=str, default=None, help="Path to crop_yield.csv dataset")
    parser.add_argument("--output-dir", type=str, default=None, help="Directory to save the trained model")
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    models_dir = Path(args.output_dir) if args.output_dir else (script_dir / "models")

    try:
        dataset_path = resolve_dataset_path(args.data)
        df, feature_cols, cat_cols, num_cols = load_and_preprocess_dataset(dataset_path)
        pipeline, metrics = train_and_evaluate(df, feature_cols, cat_cols, num_cols, random_state=42)
        save_artifacts(pipeline, feature_cols, cat_cols, num_cols, metrics, models_dir)
    except Exception as e:
        print(f"\n[ERROR] Training failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
