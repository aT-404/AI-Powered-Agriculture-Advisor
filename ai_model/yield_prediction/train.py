"""
CROP YIELD PREDICTION - REGRESSION MODEL

This script trains models to answer:
"How much yield will I get?"

Models used:
1. Random Forest Regressor
2. XGBoost Regressor

The models are compared using:
- RMSE
- MAE
- R2 Score

The trained models and label encoders are saved
inside the models/ folder.
"""

import os
from pathlib import Path

import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

import xgboost as xgb
import joblib


# ============================================================
# STEP 1: Set project paths
# ============================================================

# Get the folder where this train.py file is located
BASE_DIR = Path(__file__).resolve().parent

# Dataset location
DATA_PATH = BASE_DIR / "data" / "crop-yield.csv"

# Models folder
MODELS_DIR = BASE_DIR / "models"

# Create models folder if it doesn't exist
MODELS_DIR.mkdir(parents=True, exist_ok=True)


print("==============================================")
print("      CROP YIELD PREDICTION - TRAINING")
print("==============================================")
print()


# ============================================================
# STEP 2: Check dataset
# ============================================================

if not DATA_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found at:\n{DATA_PATH}"
    )

print("Dataset path:")
print(DATA_PATH)
print()


# ============================================================
# STEP 3: Load the dataset
# ============================================================

df = pd.read_csv(DATA_PATH)

print("Step 1: Data loaded")
print("Shape:", df.shape)
print("Missing values:", df.isnull().sum().sum())
print()


# ============================================================
# STEP 4: Remove missing rows
# ============================================================

df = df.dropna()

print("After removing missing rows:")
print("Shape:", df.shape)
print()


# ============================================================
# STEP 5: Encode text columns
# ============================================================

target_col = "Crop_Yield_ton_per_hectare"

if target_col not in df.columns:
    raise ValueError(
        f"Target column '{target_col}' was not found in the dataset.\n"
        f"Available columns: {list(df.columns)}"
    )

text_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

print("Categorical columns:", text_cols)
print()

encoders = {}

for col in text_cols:

    le = LabelEncoder()

    # Convert everything to string before encoding
    df[col] = df[col].astype(str)

    # Fit encoder on original categorical values
    df[col] = le.fit_transform(df[col])

    # Save encoder
    encoders[col] = le

    print(f"{col}:")
    print("  Classes:", list(le.classes_))
print("Step 2: Encoding text columns:")
print(text_cols)
print()



# ============================================================
# STEP 6: Split data into X and y
# ============================================================

X = df.drop(target_col, axis=1)

y = df[target_col]

print("Step 3: X and y split")

print("X columns:")
print(list(X.columns))

print()

print("Target column:")
print(target_col)

print()

print("Example yield values:")
print(y.head(3).values)

print()


# ============================================================
# STEP 7: Train/Test Split
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("Step 4: Train/test split done")

print("Training samples:", X_train.shape[0])
print("Testing samples :", X_test.shape[0])

print()


# ============================================================
# STEP 8: Train Random Forest
# ============================================================

print("Training Random Forest...")

rf_model = RandomForestRegressor(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)

rf_model.fit(
    X_train,
    y_train
)

rf_pred = rf_model.predict(X_test)

rf_rmse = np.sqrt(
    mean_squared_error(
        y_test,
        rf_pred
    )
)

rf_mae = mean_absolute_error(
    y_test,
    rf_pred
)

rf_r2 = r2_score(
    y_test,
    rf_pred
)


# ============================================================
# STEP 9: Random Forest Cross Validation
# ============================================================

rf_cv_scores = cross_val_score(
    rf_model,
    X,
    y,
    cv=5,
    scoring="r2"
)

print()
print("Step 5: Random Forest Regressor trained")

print("RMSE:", round(rf_rmse, 4))
print("MAE :", round(rf_mae, 4))
print("R2  :", round(rf_r2, 4))

print(
    "Cross-validation R2 scores:",
    np.round(rf_cv_scores, 4)
)

print(
    "Average CV R2:",
    round(rf_cv_scores.mean(), 4)
)

print()


# ============================================================
# STEP 10: Train XGBoost
# ============================================================

print("Training XGBoost...")

xgb_model = xgb.XGBRegressor(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    random_state=42,
    n_jobs=-1
)

xgb_model.fit(
    X_train,
    y_train
)

xgb_pred = xgb_model.predict(X_test)

xgb_rmse = np.sqrt(
    mean_squared_error(
        y_test,
        xgb_pred
    )
)

xgb_mae = mean_absolute_error(
    y_test,
    xgb_pred
)

xgb_r2 = r2_score(
    y_test,
    xgb_pred
)

print()
print("Step 6: XGBoost Regressor trained")

print("RMSE:", round(xgb_rmse, 4))
print("MAE :", round(xgb_mae, 4))
print("R2  :", round(xgb_r2, 4))

print()


# ============================================================
# STEP 11: Compare models
# ============================================================

print("==============================================")
print("STEP 7: MODEL COMPARISON")
print("==============================================")

print(
    f"Random Forest -> "
    f"RMSE: {rf_rmse:.4f} | "
    f"MAE: {rf_mae:.4f} | "
    f"R2: {rf_r2:.4f}"
)

print(
    f"XGBoost       -> "
    f"RMSE: {xgb_rmse:.4f} | "
    f"MAE: {xgb_mae:.4f} | "
    f"R2: {xgb_r2:.4f}"
)

print()


# ============================================================
# STEP 12: Select best model
# ============================================================

if rf_r2 >= xgb_r2:

    best_model_name = "Random Forest"
    best_model = rf_model

else:

    best_model_name = "XGBoost"
    best_model = xgb_model


print(
    f"Best model (higher R2 is better): "
    f"{best_model_name}"
)

print()


# ============================================================
# STEP 13: Feature Importance
# ============================================================

importance = pd.Series(
    best_model.feature_importances_,
    index=X.columns
).sort_values(
    ascending=False
)

print("==============================================")
print("STEP 8: FEATURE IMPORTANCE")
print("==============================================")

print(
    f"Which factors affect yield most (from {best_model_name}):"
)

print(importance)

print()


# ============================================================
# STEP 14: Save trained models
# ============================================================

rf_path = MODELS_DIR / "yield_regressor_rf.pkl"

xgb_path = MODELS_DIR / "yield_regressor_xgb.pkl"

encoder_path = MODELS_DIR / "yield_label_encoders.pkl"

features_path = MODELS_DIR / "yield_features.pkl"

best_model_path = MODELS_DIR / "best_yield_model.pkl"


joblib.dump(
    rf_model,
    MODELS_DIR / "yield_regressor_rf.pkl"
)

joblib.dump(
    xgb_model,
    MODELS_DIR / "yield_regressor_xgb.pkl"
)

joblib.dump(
    best_model,
    MODELS_DIR / "best_yield_model.pkl"
)

joblib.dump(
    encoders,
    MODELS_DIR / "yield_label_encoders.pkl"
)

joblib.dump(
    list(X.columns),
    MODELS_DIR / "yield_features.pkl"
)

# ============================================================
# STEP 15: Final output
# ============================================================

print("==============================================")
print("TRAINING COMPLETED")
print("==============================================")

print()

print("Saved models:")

print(f"1. {rf_path}")

print(f"2. {xgb_path}")

print(f"3. {encoder_path}")

print(f"4. {features_path}")

print(f"5. {best_model_path}")

print()

print("Best model:", best_model_name)

print()

print("Dataset used:")
print(DATA_PATH)

print("==============================================")