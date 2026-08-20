import re
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.core.exceptions import ValidationError

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model representing user profile details.
    """
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'phone',
            'location',
            'latitude',
            'longitude',
        )
        read_only_fields = ('id', 'email')


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name', 'phone')
        extra_kwargs = {
            'first_name': {'required': True, 'allow_blank': False},
            'last_name': {'required': True, 'allow_blank': False},
            'phone': {'required': True, 'allow_blank': False},
        }

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value

    def validate_password(self, value):
        # Validate password strength: min 8 chars, at least one letter and one number
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', '')
        )


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login credentials.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        email = data.get('email', '').strip().lower()
        password = data.get('password')

        if not email or not password:
            raise serializers.ValidationError("Must include both email and password.")

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        data['user'] = user
        return data


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for profile updates, enforcing read-only constraints on admin permissions.
    """
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'phone',
            'location',
            'latitude',
            'longitude',
        )
        read_only_fields = ('id', 'email')

    def update(self, instance, validated_data):
        # Ensure is_staff and is_superuser are excluded/removed from validated_data in case they were passed
        validated_data.pop('is_staff', None)
        validated_data.pop('is_superuser', None)
        return super().update(instance, validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change requests.
    """
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        return value
