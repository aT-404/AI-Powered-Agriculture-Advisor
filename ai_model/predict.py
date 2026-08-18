import joblib
import pandas as pd

from config import (
    MODEL_PATH,
    ENCODER_PATH,
    FEATURES
)


# ==========================================================
# LOAD TRAINED MODEL
# ==========================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}\n"
        "Run train.py first."
    )

if not ENCODER_PATH.exists():
    raise FileNotFoundError(
        f"Label encoder not found: {ENCODER_PATH}\n"
        "Run train.py first."
    )


model = joblib.load(MODEL_PATH)

label_encoder = joblib.load(
    ENCODER_PATH
)


# ==========================================================
# PREDICTION FUNCTION
# ==========================================================

def predict_crop(
    N,
    P,
    K,
    temperature,
    humidity,
    ph,
    rainfall
):

    input_data = pd.DataFrame(
        [[
            N,
            P,
            K,
            temperature,
            humidity,
            ph,
            rainfall
        ]],
        columns=FEATURES
    )

    # ------------------------------------------------------
    # PREDICT CLASS
    # ------------------------------------------------------

    predicted_encoded = model.predict(
        input_data
    )

    predicted_crop = (
        label_encoder
        .inverse_transform(
            predicted_encoded
        )[0]
    )

    # ------------------------------------------------------
    # CONFIDENCE
    # ------------------------------------------------------

    confidence = None

    if hasattr(model, "predict_proba"):

        probabilities = model.predict_proba(
            input_data
        )[0]

        confidence = float(
            probabilities.max()
        )

    # ------------------------------------------------------
    # TOP 3 RECOMMENDATIONS
    # ------------------------------------------------------

    top_recommendations = []

    if hasattr(model, "predict_proba"):

        probabilities = model.predict_proba(
            input_data
        )[0]

        top_indices = (
            probabilities
            .argsort()[::-1][:3]
        )

        for index in top_indices:

            crop = label_encoder.inverse_transform(
                [index]
            )[0]

            probability = float(
                probabilities[index]
            )

            top_recommendations.append({
                "crop": crop,
                "confidence": round(
                    probability,
                    4
                )
            })

    # ------------------------------------------------------
    # RETURN RESULT
    # ------------------------------------------------------

    return {

        "recommended_crop":
            str(predicted_crop),

        "confidence":
            round(confidence, 4)
            if confidence is not None
            else None,

        "top_recommendations":
            top_recommendations
    }


# ==========================================================
# LOCAL TEST
# ==========================================================

if __name__ == "__main__":

    result = predict_crop(
        N=90,
        P=42,
        K=43,
        temperature=20.87,
        humidity=82.00,
        ph=6.50,
        rainfall=202.93
    )

    print("\nPrediction:")
    print(result)