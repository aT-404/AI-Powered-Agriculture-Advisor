import logging
from predictions.models import PredictionInput, Prediction
from ml_models.crop_model import predict_best_crop
from ml_models.yield_model import predict_yield

logger = logging.getLogger(__name__)

class PredictionService:
    """
    Orchestration layer managing the execution flow for crops and yield ML models.
    """
    @staticmethod
    def run_prediction_pipeline(user, validated_data: dict) -> Prediction:
        # 1. Create and save the PredictionInput record
        prediction_input = PredictionInput.objects.create(
            user=user,
            nitrogen=validated_data['N'],
            phosphorus=validated_data['P'],
            potassium=validated_data['K'],
            temperature=validated_data['temperature'],
            humidity=validated_data['humidity'],
            ph=validated_data['ph'],
            rainfall=validated_data['rainfall'],
            latitude=validated_data.get('latitude'),
            longitude=validated_data.get('longitude')
        )
        
        # 2. Run crop recommendation model
        crop_result = predict_best_crop(validated_data)
        predicted_crop = crop_result["recommended_crop"]
        crop_confidence = crop_result["confidence"]
        
        # 3. Formulate input for the yield model using combination of soil inputs & defaults
        yield_input = {
            "N": validated_data['N'],
            "P": validated_data['P'],
            "K": validated_data['K'],
            "Soil_pH": validated_data['ph'],
            "Soil_Moisture": 35.0,  # standard default fallback
            "Soil_Type": "Loamy",
            "Organic_Carbon": 1.5,
            "Temperature": validated_data['temperature'],
            "Humidity": validated_data['humidity'],
            "Rainfall": validated_data['rainfall'],
            "Sunlight_Hours": 8.0,
            "Wind_Speed": 12.0,
            "Region": "South",
            "Altitude": 100.0,
            "Season": "Kharif",
            "Crop_Type": predicted_crop,
            "Irrigation_Type": "Drip",
            "Fertilizer_Used": "Yes",
            "Pesticide_Used": "No"
        }
        
        # 4. Run yield prediction model
        yield_result = predict_yield(yield_input)
        
        predicted_yield = None
        yield_unit = 'tons/hectare'
        if yield_result:
            predicted_yield = yield_result.get("predicted_yield")
            yield_unit = yield_result.get("unit", "tons/hectare")
            
        # 5. Determine user location for market rates lookup
        location = user.location
        if not location:
            # Fallback default location if farmer profile location is unconfigured
            location = "Kothamangalam, Kerala"
            
        # 6. Retrieve market price from service
        market_name, market_district, market_state = "", "", ""
        market_price, market_min_price, market_max_price = None, None, None
        market_unit = "quintal"
        price_date = None
        price_source = "data.gov.in / AGMARKNET"
        is_cached_price = False
        
        try:
            from market.services import get_market_price
            price_data = get_market_price(predicted_crop, location)
            
            market_name = price_data.get("market", "")
            market_district = price_data.get("district", "")
            market_state = price_data.get("state", "")
            market_price = price_data.get("modal_price")
            market_min_price = price_data.get("min_price")
            market_max_price = price_data.get("max_price")
            market_unit = price_data.get("unit", "quintal")
            price_source = price_data.get("source", "data.gov.in / AGMARKNET")
            is_cached_price = price_data.get("is_cached", False)
            
            from datetime import datetime
            date_str = price_data.get("price_date")
            if date_str:
                price_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except Exception as exc:
            logger.error("Failed to query market rates: %s", exc)

        # 7. Convert units and calculate expected revenue
        expected_revenue = None
        revenue_unit = "per hectare"
        
        if predicted_yield is not None and market_price is not None:
            # Normalize yield to kg
            yield_in_kg = 0.0
            if "ton" in yield_unit.lower():
                yield_in_kg = predicted_yield * 1000.0
            elif "kg" in yield_unit.lower():
                yield_in_kg = predicted_yield
            else:
                yield_in_kg = predicted_yield  # default
                
            # Normalize mandi price to INR/kg
            price_per_kg = 0.0
            if "quintal" in market_unit.lower():
                price_per_kg = market_price / 100.0
            elif "ton" in market_unit.lower():
                price_per_kg = market_price / 1000.0
            elif "kg" in market_unit.lower():
                price_per_kg = market_price
            else:
                price_per_kg = market_price / 100.0  # default
                
            expected_revenue = round(yield_in_kg * price_per_kg, 2)

        # 8. Save the Prediction result
        prediction = Prediction.objects.create(
            user=user,
            prediction_input=prediction_input,
            predicted_crop=predicted_crop,
            crop_confidence=crop_confidence,
            predicted_yield=predicted_yield,
            yield_unit=yield_unit,
            market_name=market_name,
            market_district=market_district,
            market_state=market_state,
            market_price=market_price,
            market_min_price=market_min_price,
            market_max_price=market_max_price,
            market_unit=market_unit,
            expected_revenue=expected_revenue,
            revenue_unit=revenue_unit,
            price_date=price_date,
            price_source=price_source,
            is_cached_price=is_cached_price,
            crop_model_output=crop_result,
            yield_model_output=yield_result
        )
        
        return prediction
