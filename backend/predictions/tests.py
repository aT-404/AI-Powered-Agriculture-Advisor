from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch

from crops.models import Crop
from predictions.models import PredictionInput, Prediction
from ml_models.crop_model import CropModelUnavailable

User = get_user_model()

class CropsAndPredictionsTests(APITestCase):
    """
    Test suite verifying prediction auth, validation, history, ownership, crops list, and ML integration logic.
    """
    def setUp(self):
        # Users setup
        self.user1 = User.objects.create_user(email="farmer1@example.com", password="Password123", first_name="A", last_name="B")
        self.user2 = User.objects.create_user(email="farmer2@example.com", password="Password123", first_name="C", last_name="D")
        
        # Crops setup
        self.crop = Crop.objects.create(
            name="Rice",
            scientific_name="Oryza sativa",
            ideal_temperature_min=20.0,
            ideal_temperature_max=35.0,
            ideal_ph_min=5.0,
            ideal_ph_max=6.5,
            ideal_rainfall_min=800.0,
            ideal_rainfall_max=2500.0
        )
        
        # URLs
        self.prediction_list_create_url = reverse('predictions:prediction-list-create')
        self.crop_list_url = reverse('crops:crop-list')
        self.crop_detail_url = reverse('crops:crop-detail', kwargs={'pk': self.crop.pk})

        # Test request data
        self.valid_input = {
            "N": 90,
            "P": 42,
            "K": 43,
            "temperature": 25.5,
            "humidity": 80.0,
            "ph": 6.5,
            "rainfall": 202.0,
            "latitude": 10.05,
            "longitude": 76.62
        }

    def authenticate_user(self, user):
        # Generate token and apply credentials
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    # 1. Prediction Authentication Tests
    def test_prediction_authentication_required_post(self):
        response = self.client.post(self.prediction_list_create_url, self.valid_input, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_prediction_authentication_required_get(self):
        response = self.client.get(self.prediction_list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 2. Valid Prediction Request Test
    def test_valid_prediction_request(self):
        self.authenticate_user(self.user1)
        response = self.client.post(self.prediction_list_create_url, self.valid_input, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("crop_prediction", response.data)
        self.assertIn("yield_prediction", response.data)
        self.assertEqual(response.data["crop_prediction"]["crop"], "Rice")
        self.assertEqual(response.data["yield_prediction"]["yield"], 4.21)
        self.assertIn("market", response.data)
        self.assertIn("financial_estimate", response.data)
        self.assertEqual(response.data["market"]["modal_price"], 3950.0)
        self.assertEqual(response.data["financial_estimate"]["expected_revenue"], 166295.0)

        # Check DB objects
        self.assertEqual(PredictionInput.objects.count(), 1)
        self.assertEqual(Prediction.objects.count(), 1)

    # 3. Invalid Input Validation Tests
    def test_prediction_invalid_input_missing_fields(self):
        self.authenticate_user(self.user1)
        invalid_input = self.valid_input.copy()
        del invalid_input["N"]
        response = self.client.post(self.prediction_list_create_url, invalid_input, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("N", response.data)

    def test_prediction_invalid_input_negative(self):
        self.authenticate_user(self.user1)
        invalid_input = self.valid_input.copy()
        invalid_input["N"] = -10
        response = self.client.post(self.prediction_list_create_url, invalid_input, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("N", response.data)

    def test_prediction_invalid_input_nan(self):
        self.authenticate_user(self.user1)
        invalid_input = self.valid_input.copy()
        invalid_input["ph"] = "NaN"
        response = self.client.post(self.prediction_list_create_url, invalid_input, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("ph", response.data)

    # 4. Prediction History Scoping
    def test_prediction_history_scoped_to_user(self):
        # Create a prediction for user 1
        self.authenticate_user(self.user1)
        self.client.post(self.prediction_list_create_url, self.valid_input, format='json')
        
        # Verify user 1 gets 1 item
        resp1 = self.client.get(self.prediction_list_create_url)
        self.assertEqual(resp1.status_code, status.HTTP_200_OK)
        # Accounts for pagination structure
        self.assertEqual(resp1.data["count"], 1)

        # Verify user 2 gets 0 items
        self.authenticate_user(self.user2)
        resp2 = self.client.get(self.prediction_list_create_url)
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        self.assertEqual(resp2.data["count"], 0)

    # 5. Prediction Ownership Tests
    def test_prediction_ownership_detail_access_denied(self):
        # Create prediction for user 1
        self.authenticate_user(self.user1)
        create_resp = self.client.post(self.prediction_list_create_url, self.valid_input, format='json')
        pred_id = create_resp.data["id"]

        # Authenticate as user 2 and try accessing user 1's prediction
        self.authenticate_user(self.user2)
        detail_url = reverse('predictions:prediction-detail-delete', kwargs={'pk': pred_id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_prediction_ownership_delete_access_denied(self):
        # Create prediction for user 1
        self.authenticate_user(self.user1)
        create_resp = self.client.post(self.prediction_list_create_url, self.valid_input, format='json')
        pred_id = create_resp.data["id"]

        # Authenticate as user 2 and try deleting user 1's prediction
        self.authenticate_user(self.user2)
        detail_url = reverse('predictions:prediction-detail-delete', kwargs={'pk': pred_id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_prediction_delete_success(self):
        self.authenticate_user(self.user1)
        create_resp = self.client.post(self.prediction_list_create_url, self.valid_input, format='json')
        pred_id = create_resp.data["id"]

        detail_url = reverse('predictions:prediction-detail-delete', kwargs={'pk': pred_id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Prediction.objects.count(), 0)

    # 6. Crops API Tests
    def test_crop_list_success(self):
        response = self.client.get(self.crop_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Rice")

    def test_crop_detail_success(self):
        response = self.client.get(self.crop_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Rice")
        self.assertEqual(response.data["scientific_name"], "Oryza sativa")

    # 7. ML Integration Failure
    @patch('services.prediction_service.predict_best_crop')
    def test_ml_integration_failure_handling(self, mock_predict):
        mock_predict.side_effect = CropModelUnavailable("Missing ML model file champ.")
        self.authenticate_user(self.user1)
        response = self.client.post(self.prediction_list_create_url, self.valid_input, format='json')
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("error", response.data)
