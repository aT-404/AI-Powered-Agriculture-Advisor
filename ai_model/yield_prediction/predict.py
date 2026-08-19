import json
import joblib
import pandas as pd
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

INPUT_PATH = BASE_DIR / "input.json"

MODEL_PATH = BASE_DIR / "models" / "best_yield_model.pkl"

ENCODER_PATH = BASE_DIR / "models" / "yield_label_encoders.pkl"

FEATURES_PATH = BASE_DIR / "models" / "yield_features.pkl"


# ============================================================
# LOAD MODEL
# ============================================================

print("==============================================")
print("       CROP YIELD PREDICTION")
print("==============================================")

model = joblib.load(MODEL_PATH)

encoders = joblib.load(ENCODER_PATH)

features = joblib.load(FEATURES_PATH)

print("Model loaded successfully.")


# ============================================================
# LOAD INPUT JSON
# ============================================================

with open(INPUT_PATH, "r") as file:

    input_data = json.load(file)

input_df = pd.DataFrame([input_data])


print()
print("Input received successfully.")


# ============================================================
# CHECK FEATURES
# ============================================================

missing_features = [
    feature
    for feature in features
    if feature not in input_df.columns
]

if missing_features:

    raise ValueError(
        f"Missing features: {missing_features}"
    )


# ============================================================
# ENCODE CATEGORICAL FEATURES
# ============================================================

for col, encoder in encoders.items():

    if col not in input_df.columns:
        continue

    value = input_df[col].iloc[0]

    print(f"Encoding {col}: {value}")

    # Check whether value exists in training categories
    if value not in encoder.classes_:

        raise ValueError(
            f"\nUnknown value for {col}: {value}\n"
            f"Allowed values:\n{list(encoder.classes_)}"
        )

    # Encode value
    input_df[col] = encoder.transform(
        input_df[col]
    )


# ============================================================
# HANDLE YES/NO (BOOLEAN-STYLE) COLUMNS
# ============================================================
# Some columns (e.g. Fertilizer_Used, Pesticide_Used) may have been
# stored as 0/1 or True/False in the training CSV, so they never went
# through the categorical LabelEncoder step above. If the JSON input
# gives them as "Yes"/"No" strings instead, convert them here so the
# numeric-cast step below doesn't fail.

YES_NO_MAP = {
    "yes": 1, "no": 0,
    "true": 1, "false": 0,
    "y": 1, "n": 0,
}

for col in input_df.columns:

    if col in encoders:
        continue  # already numeric-encoded above

    value = input_df[col].iloc[0]

    if isinstance(value, str) and value.strip().lower() in YES_NO_MAP:

        print(f"Encoding {col} (yes/no): {value}")

        input_df[col] = YES_NO_MAP[value.strip().lower()]


# ============================================================
# FORCE NUMERIC DATA
# ============================================================

for col in input_df.columns:

    input_df[col] = pd.to_numeric(
        input_df[col],
        errors="raise"
    )


# ============================================================
# ARRANGE FEATURES IN TRAINING ORDER
# ============================================================

input_df = input_df[features]


print()
print("Final model input:")
print(input_df)


# ============================================================
# PREDICTION
# ============================================================

prediction = model.predict(input_df)[0]


# ============================================================
# OUTPUT
# ============================================================

print()
print("==============================================")
print("             PREDICTION RESULT")
print("==============================================")

print(
    f"Predicted Crop Yield: "
    f"{prediction:.2f} tons/hectare"
)

print("==============================================")