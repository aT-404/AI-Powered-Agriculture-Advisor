from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthAPISelectionTests(APITestCase):
    """
    Test suite for user registration, login, profile management, and token refresh.
    """
    def setUp(self):
        self.register_url = reverse('accounts:register')
        self.login_url = reverse('accounts:login')
        self.profile_url = reverse('accounts:profile')
        self.change_password_url = reverse('accounts:change_password')
        self.token_refresh_url = reverse('accounts:token_refresh')
        self.logout_url = reverse('accounts:logout')

        self.user_data = {
            "email": "testfarmer@example.com",
            "password": "StrongPassword123",
            "first_name": "Ramesh",
            "last_name": "Kumar",
            "phone": "9876543210"
        }

    def register_user(self):
        return self.client.post(self.register_url, self.user_data, format='json')

    def test_registration_success(self):
        response = self.register_user()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], self.user_data['email'])
        self.assertEqual(response.data['user']['first_name'], self.user_data['first_name'])
        self.assertNotIn('password', response.data['user'])

    def test_registration_duplicate_email(self):
        self.register_user()
        # Attempt to register again
        response = self.register_user()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_registration_invalid_email(self):
        invalid_data = self.user_data.copy()
        invalid_data['email'] = 'not-an-email'
        response = self.client.post(self.register_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_login_success(self):
        self.register_user()
        login_data = {
            "email": self.user_data['email'],
            "password": self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], self.user_data['email'])

    def test_login_invalid_credentials(self):
        self.register_user()
        login_data = {
            "email": self.user_data['email'],
            "password": "WrongPassword999"
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn('access', response.data)

    def test_jwt_refresh(self):
        reg_resp = self.register_user()
        refresh_token = reg_resp.data['refresh']

        response = self.client.post(self.token_refresh_url, {"refresh": refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_profile_get_protected(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_get_success(self):
        reg_resp = self.register_user()
        access_token = reg_resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user_data['email'])

    def test_profile_update(self):
        reg_resp = self.register_user()
        access_token = reg_resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        update_data = {
            "first_name": "Suresh",
            "last_name": "Rao",
            "phone": "9999999999",
            "location": "Kerala, India",
            "latitude": 10.05,
            "longitude": 76.62,
            "is_staff": True,      # Read-only field, must be ignored / blocked
            "is_superuser": True  # Read-only field, must be ignored / blocked
        }

        # Test partial update (PATCH)
        patch_response = self.client.patch(self.profile_url, {"first_name": "Suresh Rao Patch"}, format='json')
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data['first_name'], "Suresh Rao Patch")

        # Test full update (PUT)
        response = self.client.put(self.profile_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], "Suresh")
        self.assertEqual(response.data['last_name'], "Rao")
        self.assertEqual(response.data['phone'], "9999999999")
        self.assertEqual(response.data['location'], "Kerala, India")
        self.assertEqual(response.data['latitude'], 10.05)
        self.assertEqual(response.data['longitude'], 76.62)

        # Retrieve user database state to ensure is_staff & is_superuser were not modified
        user = User.objects.get(email=self.user_data['email'])
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_change_password(self):
        reg_resp = self.register_user()
        access_token = reg_resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        change_data = {
            "old_password": self.user_data['password'],
            "new_password": "NewStrongPassword123"
        }
        response = self.client.post(self.change_password_url, change_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Clear credentials and try login with old password
        self.client.credentials()
        login_data = {
            "email": self.user_data['email'],
            "password": self.user_data['password']
        }
        login_resp = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(login_resp.status_code, status.HTTP_400_BAD_REQUEST)

        # Try login with new password
        login_data['password'] = "NewStrongPassword123"
        login_resp2 = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(login_resp2.status_code, status.HTTP_200_OK)

    def test_logout(self):
        reg_resp = self.register_user()
        access_token = reg_resp.data['access']
        refresh_token = reg_resp.data['refresh']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.post(self.logout_url, {"refresh": refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify that refresh token cannot be used again
        refresh_resp = self.client.post(self.token_refresh_url, {"refresh": refresh_token}, format='json')
        self.assertEqual(refresh_resp.status_code, status.HTTP_401_UNAUTHORIZED)
