from pathlib import Path

# ==========================================================
# PROJECT PATHS
# ==========================================================

AI_MODEL_DIR = Path(__file__).resolve().parent

MODEL_DIR = AI_MODEL_DIR / "model"

MODEL_PATH = MODEL_DIR / "champion_crop_model.pkl"
ENCODER_PATH = MODEL_DIR / "crop_label_encoder.pkl"
METADATA_PATH = MODEL_DIR / "model_metadata.json"

# ==========================================================
# DATASET
# ==========================================================

DATASET_PATH = AI_MODEL_DIR / "Crop_recommendation.csv"

# ==========================================================
# MODEL INPUT FEATURES
# ==========================================================

FEATURES = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]

TARGET = "label"

# ==========================================================
# TRAINING CONFIGURATION
# ==========================================================

TEST_SIZE = 0.20
RANDOM_STATE = 42
CV_FOLDS = 5

TARGET_ACCURACY = 90.0