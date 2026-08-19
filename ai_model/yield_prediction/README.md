# Crop Yield Prediction

This module predicts crop yield in tons per hectare using machine learning regression models.

## Models Used

Two regression models are trained and compared:

1. Random Forest Regressor
2. XGBoost Regressor

The models are evaluated using:

- RMSE
- MAE
- R² Score
- 5-Fold Cross Validation for Random Forest

## Project Structure

```text
yield_prediction/
│
├── train.py
├── predict.py
├── requirements.txt
├── README.md
│
├── data/
│   └── crop-yield.csv
│
└── models/
    ├── yield_regressor_rf.pkl
    ├── yield_regressor_xgb.pkl
    ├── yield_label_encoders.pkl
    └── yield_features.pkl