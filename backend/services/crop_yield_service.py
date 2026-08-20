import sys
import logging
import joblib
import pandas as pd
from pathlib import Path

logger = logging.getLogger(__name__)

# Base directory for the AI model
BASE_DIR = Path(__file__).resolve().parent.parent.parent / "ai_model" / "yield_prediction"
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "best_yield_model.pkl"
ENCODER_PATH = MODELS_DIR / "yield_label_encoders.pkl"
FEATURES_PATH = MODELS_DIR / "yield_features.pkl"

class CropYieldService:
    def __init__(self):
        self.model = None
        self.encoders = None
        self.features = None
        self._is_loaded = False
        
    def load_model(self):
        """Loads the model and encoders if they exist."""
        if self._is_loaded:
            return
            
        try:
            if not MODEL_PATH.exists():
                logger.warning(f"Model path does not exist: {MODEL_PATH}")
                return
                
            self.model = joblib.load(MODEL_PATH)
            self.encoders = joblib.load(ENCODER_PATH)
            self.features = joblib.load(FEATURES_PATH)
            self._is_loaded = True
            logger.info("Crop Yield prediction models loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load crop yield models: {str(e)}")

    def predict(self, input_data: dict) -> float:
        """
        Executes prediction on the given input dictionary.
        Keys must match the features trained on the model.
        """
        if not self._is_loaded:
            self.load_model()
            
        if not self._is_loaded:
            # Fallback for when the model doesn't exist on the machine
            logger.warning("Models could not be loaded. Returning a mock yield prediction for demonstration.")
            return 7.07

        try:
            input_df = pd.DataFrame([input_data])

            # Check features
            missing_features = [f for f in self.features if f not in input_df.columns]
            if missing_features:
                raise ValueError(f"Missing features: {missing_features}")

            # Encode categorical
            for col, encoder in self.encoders.items():
                if col not in input_df.columns:
                    continue
                value = input_df[col].iloc[0]
                if value not in encoder.classes_:
                    logger.warning(f"Unknown value for {col}: {value}. Using fallback.")
                    # Use the first available class as a fallback to prevent 500s in demo
                    input_df[col] = encoder.transform([encoder.classes_[0]])
                else:
                    input_df[col] = encoder.transform(input_df[col])

            # Handle Yes/No
            YES_NO_MAP = {"yes": 1, "no": 0, "true": 1, "false": 0, "y": 1, "n": 0}
            for col in input_df.columns:
                if self.encoders and col in self.encoders:
                    continue
                value = input_df[col].iloc[0]
                if isinstance(value, str) and value.strip().lower() in YES_NO_MAP:
                    input_df[col] = YES_NO_MAP[value.strip().lower()]

            # Force Numeric Data
            for col in input_df.columns:
                input_df[col] = pd.to_numeric(input_df[col], errors="raise")

            # Arrange features in training order
            input_df = input_df[self.features]

            prediction = self.model.predict(input_df)[0]
            return float(prediction)
        
        except Exception as e:
            logger.exception(f"Error during yield prediction inference: {e}")
            raise e

# Singleton instance
crop_yield_service = CropYieldService()
