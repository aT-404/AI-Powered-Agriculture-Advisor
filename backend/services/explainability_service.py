import logging
import shap
import pandas as pd
from services.crop_yield_service import crop_yield_service

logger = logging.getLogger(__name__)

class ExplainabilityService:
    def __init__(self):
        self.yield_explainer = None
        self._is_loaded = False

    def _initialize_yield_explainer(self):
        if not crop_yield_service._is_loaded:
            crop_yield_service.load_model()
            
        if crop_yield_service.model is not None:
            # Check if model is tree-based (RandomForest, XGBoost, etc.)
            try:
                self.yield_explainer = shap.TreeExplainer(crop_yield_service.model)
                self._is_loaded = True
                logger.info("Yield Explainer loaded successfully.")
            except Exception as e:
                logger.warning(f"Failed to use TreeExplainer, trying generic Explainer: {e}")
                try:
                    self.yield_explainer = shap.Explainer(crop_yield_service.model)
                    self._is_loaded = True
                except Exception as e2:
                    logger.error(f"Failed to initialize SHAP explainer: {e2}")

    def explain_yield_prediction(self, input_data: dict) -> list:
        if not self._is_loaded:
            self._initialize_yield_explainer()
            
        if not self._is_loaded or self.yield_explainer is None:
            logger.warning("Yield explainer could not be loaded. Returning empty explanation.")
            return []
            
        try:
            # We need to process input_data exactly like in predict()
            input_df = pd.DataFrame([input_data])

            for col, encoder in crop_yield_service.encoders.items():
                if col not in input_df.columns:
                    continue
                value = input_df[col].iloc[0]
                if value not in encoder.classes_:
                    input_df[col] = encoder.transform([encoder.classes_[0]])
                else:
                    input_df[col] = encoder.transform(input_df[col])

            YES_NO_MAP = {"yes": 1, "no": 0, "true": 1, "false": 0, "y": 1, "n": 0}
            for col in input_df.columns:
                if crop_yield_service.encoders and col in crop_yield_service.encoders:
                    continue
                value = input_df[col].iloc[0]
                if isinstance(value, str) and value.strip().lower() in YES_NO_MAP:
                    input_df[col] = YES_NO_MAP[value.strip().lower()]

            for col in input_df.columns:
                input_df[col] = pd.to_numeric(input_df[col], errors="raise")

            input_df = input_df[crop_yield_service.features]

            shap_values = self.yield_explainer.shap_values(input_df)
            
            # Extract values for the single instance
            # shap_values could be a list for multi-class, but for regression it's an array
            if isinstance(shap_values, list):
                vals = shap_values[0][0]
            else:
                vals = shap_values[0]
                
            feature_names = crop_yield_service.features
            
            explanation = []
            for name, val in zip(feature_names, vals):
                explanation.append({
                    "feature": name,
                    "contribution": float(val)
                })
                
            # Sort by absolute contribution descending
            explanation.sort(key=lambda x: abs(x["contribution"]), reverse=True)
            return explanation
            
        except Exception as e:
            logger.exception(f"Error generating SHAP explanation: {e}")
            return []

explainability_service = ExplainabilityService()
