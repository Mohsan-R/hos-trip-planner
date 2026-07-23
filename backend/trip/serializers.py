from rest_framework import serializers
from .models import Trip

class TripInputSerializer(serializers.Serializer):
    current_location = serializers.CharField(
        max_length=255, trim_whitespace=True, allow_blank=False,
        error_messages={
            'required': 'Current location is required.',
            'blank': 'Current location is required.',
            'max_length': 'Location cannot exceed 255 characters.'
        }
    )
    pickup_location = serializers.CharField(
        max_length=255, trim_whitespace=True, allow_blank=False,
        error_messages={
            'required': 'Pickup location is required.',
            'blank': 'Pickup location is required.',
            'max_length': 'Location cannot exceed 255 characters.'
        }
    )
    dropoff_location = serializers.CharField(
        max_length=255, trim_whitespace=True, allow_blank=False,
        error_messages={
            'required': 'Dropoff location is required.',
            'blank': 'Dropoff location is required.',
            'max_length': 'Location cannot exceed 255 characters.'
        }
    )
    current_cycle_hours = serializers.FloatField(
        min_value=0, max_value=70,
        error_messages={
            'required': 'Current cycle hours is required.',
            'invalid': 'Current cycle hours must be numeric.',
            'min_value': 'Current cycle hours cannot be negative.',
            'max_value': 'Current cycle hours cannot exceed 70.'
        }
    )

class TripResponseSerializer(serializers.ModelSerializer):
    legs = serializers.JSONField(read_only=True)

    class Meta:
        model = Trip
        fields = ['id', 'current_location', 'pickup_location', 'dropoff_location', 'current_cycle_hours', 'distance', 'driving_time', 'route_geometry', 'legs', 'created_at']
