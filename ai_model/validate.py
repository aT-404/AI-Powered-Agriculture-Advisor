import os
import joblib
import numpy as np
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    classification_report
)

from config import (
    AI_MODEL_DIR,
    DATASET_PATH,
    MODEL_PATH,
    ENCODER_PATH,
    FEATURES
)


# ==========================================================
# EXTERNAL DATASETS
# ==========================================================

TEST_DATASET_DIR = AI_MODEL_DIR / "testing_datasets"

DATASETS_TO_TEST = [

    "cropgan_dataset.csv",
    "merged_crop_dataset.csv",
    "original_dataset.csv",
    "original_processed_dataset.csv",
    "smote_dataset.csv",
    "standardized_crops.csv",
    "vae_dataset.csv",
    "mega_testing_dataset.csv"
]


# ==========================================================
# NUMERIC LABEL MAPPING
# ==========================================================

numeric_to_text_map = {

    0.0: "beans",
    1.0: "cassava",
    2.0: "guinea_corn",
    3.0: "maize",
    4.0: "orange",
    5.0: "pepper",
    6.0: "rice",
    7.0: "soybean",
    8.0: "tomatoes",
    9.0: "yam"
}


# ==========================================================
# FIND TARGET COLUMN
# ==========================================================

def find_target_column(df):

    possible_targets = [
        "label",
        "crop",
        "crop_label",
        "Crop",
        "Crop_Type",
        "crop_type",
        "target",
        "Target"
    ]

    for column in possible_targets:

        if column in df.columns:
            return column

    return None


# ==========================================================
# STANDARDIZE LABELS
# ==========================================================

def standardize_labels(series):

    standardized = []

    for value in series:

        if isinstance(
            value,
            (
                int,
                float,
                np.integer,
                np.floating
            )
        ):

            try:

                numeric_value = float(value)

                crop_name = (
                    numeric_to_text_map
                    .get(
                        numeric_value,
                        "unknown"
                    )
                )

            except Exception:

                crop_name = "unknown"

        else:

            crop_name = (
                str(value)
                .strip()
                .lower()
            )

        standardized.append(
            crop_name
        )

    return standardized


# ==========================================================
# CREATE MASTER SIGNATURES
# ==========================================================

def create_master_signatures():

    master_df = pd.read_csv(
        DATASET_PATH
    )

    master_df["label"] = (
        master_df["label"]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    signatures = set(

        tuple(row)

        for row in master_df[
            FEATURES + ["label"]
        ].itertuples(
            index=False,
            name=None
        )
    )

    return signatures


# ==========================================================
# LOAD MODEL
# ==========================================================

def load_model():

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )

    if not ENCODER_PATH.exists():
        raise FileNotFoundError(
            f"Encoder not found: {ENCODER_PATH}"
        )

    model = joblib.load(
        MODEL_PATH
    )

    encoder = joblib.load(
        ENCODER_PATH
    )

    return model, encoder


# ==========================================================
# VALIDATE ONE DATASET
# ==========================================================

def validate_dataset(
    filepath,
    model,
    encoder,
    master_signatures
):

    print("\n" + "=" * 80)

    print(
        f"TESTING: {filepath.name}"
    )

    print("=" * 80)

    if not filepath.exists():

        print("FILE NOT FOUND")

        return {
            "Dataset": filepath.name,
            "Status": "FILE NOT FOUND"
        }

    try:

        df = pd.read_csv(
            filepath
        )

    except Exception as error:

        print(
            f"READ ERROR: {error}"
        )

        return {
            "Dataset": filepath.name,
            "Status": "READ ERROR"
        }

    original_rows = len(df)

    # ------------------------------------------------------
    # CHECK FEATURES
    # ------------------------------------------------------

    missing_features = [
        feature
        for feature in FEATURES
        if feature not in df.columns
    ]

    if missing_features:

        return {
            "Dataset": filepath.name,
            "Original Rows": original_rows,
            "Status": "MISSING FEATURES",
            "Missing Features":
                str(missing_features)
        }

    # ------------------------------------------------------
    # FIND TARGET
    # ------------------------------------------------------

    target_column = find_target_column(df)

    if target_column is None:

        return {
            "Dataset": filepath.name,
            "Original Rows": original_rows,
            "Status": "NO TARGET COLUMN"
        }

    # ------------------------------------------------------
    # STANDARDIZE TARGET
    # ------------------------------------------------------

    df["standardized_target"] = (
        standardize_labels(
            df[target_column]
        )
    )

    known_classes = set(
        encoder.classes_
    )

    df = df[
        df["standardized_target"]
        .isin(known_classes)
    ].copy()

    # ------------------------------------------------------
    # REMOVE MISSING VALUES
    # ------------------------------------------------------

    df = df.dropna(
        subset=FEATURES + [
            "standardized_target"
        ]
    ).copy()

    # ------------------------------------------------------
    # REMOVE DUPLICATES
    # ------------------------------------------------------

    duplicate_mask = []

    for row in df[
        FEATURES + ["standardized_target"]
    ].itertuples(
        index=False,
        name=None
    ):

        duplicate_mask.append(
            tuple(row)
            in master_signatures
        )

    duplicate_count = sum(
        duplicate_mask
    )

    # IMPORTANT:
    # Remove master-dataset duplicates
    # before external validation.

    if duplicate_count > 0:

        df = df[
            ~np.array(
                duplicate_mask
            )
        ].copy()

    # Remove duplicates within
    # the external dataset.

    df = df.drop_duplicates(
        subset=FEATURES + [
            "standardized_target"
        ]
    ).copy()

    valid_rows = len(df)

    if valid_rows == 0:

        return {
            "Dataset": filepath.name,
            "Original Rows": original_rows,
            "Valid Rows": 0,
            "Exact Duplicates": duplicate_count,
            "Status": "NO VALID ROWS"
        }

    # ------------------------------------------------------
    # PREDICTION
    # ------------------------------------------------------

    X_external = df[FEATURES]

    y_external = df[
        "standardized_target"
    ]

    predictions_encoded = (
        model.predict(
            X_external
        )
    )

    predictions = (
        encoder.inverse_transform(
            predictions_encoded
        )
    )

    predictions = [
        str(prediction)
        .lower()
        for prediction in predictions
    ]

    # ------------------------------------------------------
    # ACCURACY
    # ------------------------------------------------------

    accuracy = (
        accuracy_score(
            y_external,
            predictions
        ) * 100
    )

    correct = sum(
        true == pred
        for true, pred in zip(
            y_external,
            predictions
        )
    )

    wrong = (
        valid_rows - correct
    )

    print(
        f"Original rows: {original_rows}"
    )

    print(
        f"Removed master duplicates: "
        f"{duplicate_count}"
    )

    print(
        f"Valid rows: {valid_rows}"
    )

    print(
        f"Accuracy: {accuracy:.2f}%"
    )

    print("\nClassification Report:")

    print(
        classification_report(
            y_external,
            predictions,
            digits=4,
            zero_division=0
        )
    )

    return {

        "Dataset":
            filepath.name,

        "Original Rows":
            original_rows,

        "Valid Rows":
            valid_rows,

        "Exact Duplicates Removed":
            duplicate_count,

        "Correct":
            correct,

        "Wrong":
            wrong,

        "Accuracy (%)":
            round(
                accuracy,
                2
            ),

        "Status":
            "TESTED"
    }


# ==========================================================
# MAIN
# ==========================================================

def main():

    print("=" * 80)
    print("EXTERNAL MODEL VALIDATION")
    print("=" * 80)

    model, encoder = load_model()

    master_signatures = (
        create_master_signatures()
    )

    results = []

    for filename in DATASETS_TO_TEST:

        filepath = (
            TEST_DATASET_DIR
            / filename
        )

        result = validate_dataset(
            filepath,
            model,
            encoder,
            master_signatures
        )

        results.append(result)

    # ------------------------------------------------------
    # SAVE RESULTS
    # ------------------------------------------------------

    results_df = pd.DataFrame(
        results
    )

    output_path = (
        TEST_DATASET_DIR
        / "external_validation_results.csv"
    )

    results_df.to_csv(
        output_path,
        index=False
    )

    print("\n" + "=" * 80)
    print("FINAL VALIDATION SUMMARY")
    print("=" * 80)

    print(
        results_df.to_string(
            index=False
        )
    )

    print(
        f"\nResults saved to:\n"
        f"{output_path}"
    )


if __name__ == "__main__":
    main()