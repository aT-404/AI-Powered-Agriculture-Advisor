import json
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_val_score
)

from sklearn.preprocessing import LabelEncoder

from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier
)

from xgboost import XGBClassifier

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

import matplotlib.pyplot as plt
import seaborn as sns

from config import (
    DATASET_PATH,
    MODEL_DIR,
    MODEL_PATH,
    ENCODER_PATH,
    METADATA_PATH,
    FEATURES,
    TARGET,
    TEST_SIZE,
    RANDOM_STATE,
    CV_FOLDS,
    TARGET_ACCURACY
)


# ==========================================================
# 1. LOAD DATASET
# ==========================================================

def load_dataset():

    print("=" * 70)
    print("CROP RECOMMENDATION MODEL TRAINING")
    print("=" * 70)

    print("\n--> Loading dataset...")

    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found:\n{DATASET_PATH}"
        )

    df = pd.read_csv(DATASET_PATH)

    print(
        f"Dataset shape: "
        f"{df.shape[0]} samples, {df.shape[1]} columns"
    )

    print("\nMissing values:")
    print(df.isnull().sum())

    return df


# ==========================================================
# 2. PREPARE DATA
# ==========================================================

def prepare_data(df):

    missing_features = [
        feature
        for feature in FEATURES
        if feature not in df.columns
    ]

    if missing_features:
        raise ValueError(
            f"Missing required features: {missing_features}"
        )

    if TARGET not in df.columns:
        raise ValueError(
            f"Target column '{TARGET}' not found."
        )

    X = df[FEATURES].copy()
    y_raw = df[TARGET].astype(str).str.strip().str.lower()

    # Encode crop names
    label_encoder = LabelEncoder()

    y = label_encoder.fit_transform(y_raw)

    print(
        f"\nNumber of crop classes: "
        f"{len(label_encoder.classes_)}"
    )

    print(
        f"Classes: "
        f"{list(label_encoder.classes_)}"
    )

    return X, y, label_encoder


# ==========================================================
# 3. DEFINE MODELS
# ==========================================================

def create_models():

    models = {

        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            random_state=RANDOM_STATE,
            n_jobs=-1
        ),

        "Extra Trees": ExtraTreesClassifier(
            n_estimators=100,
            random_state=RANDOM_STATE,
            n_jobs=-1
        ),

        "XGBoost": XGBClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=RANDOM_STATE,
            eval_metric="mlogloss",
            n_jobs=-1
        )
    }

    return models


# ==========================================================
# 4. TRAIN AND EVALUATE
# ==========================================================

def train_models(X_train, X_test, y_train, y_test, models,
                 class_names):

    cv = StratifiedKFold(
        n_splits=CV_FOLDS,
        shuffle=True,
        random_state=RANDOM_STATE
    )

    results = []
    trained_models = {}

    for name, model in models.items():

        print("\n" + "=" * 70)
        print(f"TRAINING: {name}")
        print("=" * 70)

        # --------------------------------------------------
        # CROSS VALIDATION
        # --------------------------------------------------

        cv_scores = cross_val_score(
            model,
            X_train,
            y_train,
            cv=cv,
            scoring="accuracy",
            n_jobs=-1
        )

        mean_cv_accuracy = np.mean(cv_scores) * 100
        std_cv_accuracy = np.std(cv_scores) * 100

        print(
            "CV Accuracy: "
            f"{[round(x * 100, 2) for x in cv_scores]}"
        )

        print(
            f"Mean CV Accuracy: "
            f"{mean_cv_accuracy:.2f}%"
        )

        print(
            f"CV Standard Deviation: "
            f"{std_cv_accuracy:.2f}%"
        )

        # --------------------------------------------------
        # FINAL TRAINING
        # --------------------------------------------------

        model.fit(X_train, y_train)

        trained_models[name] = model

        # --------------------------------------------------
        # TEST SET
        # --------------------------------------------------

        predictions = model.predict(X_test)

        test_accuracy = (
            accuracy_score(
                y_test,
                predictions
            ) * 100
        )

        print(
            f"Test Accuracy: "
            f"{test_accuracy:.2f}%"
        )

        # --------------------------------------------------
        # CLASSIFICATION REPORT
        # --------------------------------------------------

        print("\nClassification Report:")

        print(
            classification_report(
                y_test,
                predictions,
                target_names=class_names,
                digits=4
            )
        )

        # --------------------------------------------------
        # CONFUSION MATRIX
        # --------------------------------------------------

        cm = confusion_matrix(
            y_test,
            predictions
        )

        plt.figure(figsize=(12, 10))

        sns.heatmap(
            cm,
            annot=True,
            fmt="d",
            cmap="Blues",
            xticklabels=class_names,
            yticklabels=class_names
        )

        plt.title(
            f"Confusion Matrix - {name}"
        )

        plt.xlabel("Predicted Crop")
        plt.ylabel("Actual Crop")

        plt.xticks(rotation=45, ha="right")
        plt.tight_layout()

        plt.show()

        # --------------------------------------------------
        # STORE RESULTS
        # --------------------------------------------------

        results.append({
            "Model": name,
            "Mean CV Accuracy (%)":
                round(mean_cv_accuracy, 2),
            "CV Std Dev (%)":
                round(std_cv_accuracy, 2),
            "Test Accuracy (%)":
                round(test_accuracy, 2)
        })

    return (
        pd.DataFrame(results),
        trained_models
    )


# ==========================================================
# 5. SELECT BEST MODEL
# ==========================================================

def select_best_model(
    results_df,
    trained_models
):

    best_row = (
        results_df
        .sort_values(
            by="Mean CV Accuracy (%)",
            ascending=False
        )
        .iloc[0]
    )

    best_model_name = best_row["Model"]

    best_model = trained_models[
        best_model_name
    ]

    print("\n" + "=" * 70)
    print("BEST MODEL")
    print("=" * 70)

    print(
        f"Model: {best_model_name}"
    )

    print(
        f"Mean CV Accuracy: "
        f"{best_row['Mean CV Accuracy (%)']}%"
    )

    print(
        f"Test Accuracy: "
        f"{best_row['Test Accuracy (%)']}%"
    )

    if best_row["Test Accuracy (%)"] >= TARGET_ACCURACY:
        print(
            f"Target accuracy of "
            f"{TARGET_ACCURACY}% achieved."
        )
    else:
        print(
            f"WARNING: Test accuracy is below "
            f"{TARGET_ACCURACY}%."
        )

    return best_model_name, best_model, best_row


# ==========================================================
# 6. SAVE MODEL
# ==========================================================

def save_model(
    best_model,
    label_encoder,
    best_model_name,
    best_row
):

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    joblib.dump(
        best_model,
        MODEL_PATH
    )

    joblib.dump(
        label_encoder,
        ENCODER_PATH
    )

    metadata = {

        "model_name": best_model_name,

        "features": FEATURES,

        "target": TARGET,

        "mean_cv_accuracy": float(
            best_row["Mean CV Accuracy (%)"]
        ),

        "test_accuracy": float(
            best_row["Test Accuracy (%)"]
        ),

        "number_of_classes": len(
            label_encoder.classes_
        ),

        "classes": [
            str(x)
            for x in label_encoder.classes_
        ],

        "random_state": RANDOM_STATE
    }

    with open(
        METADATA_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            metadata,
            file,
            indent=4
        )

    print("\nModel saved successfully.")

    print(
        f"Model: {MODEL_PATH}"
    )

    print(
        f"Encoder: {ENCODER_PATH}"
    )

    print(
        f"Metadata: {METADATA_PATH}"
    )


# ==========================================================
# 7. MAIN
# ==========================================================

def main():

    df = load_dataset()

    X, y, label_encoder = prepare_data(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y
    )

    print("\nData split:")
    print(
        f"Training samples: {len(X_train)}"
    )

    print(
        f"Testing samples: {len(X_test)}"
    )

    models = create_models()

    results_df, trained_models = train_models(
        X_train,
        X_test,
        y_train,
        y_test,
        models,
        label_encoder.classes_
    )

    print("\n" + "=" * 70)
    print("MODEL COMPARISON")
    print("=" * 70)

    print(
        results_df.to_string(index=False)
    )

    (
        best_model_name,
        best_model,
        best_row
    ) = select_best_model(
        results_df,
        trained_models
    )

    save_model(
        best_model,
        label_encoder,
        best_model_name,
        best_row
    )


if __name__ == "__main__":
    main()