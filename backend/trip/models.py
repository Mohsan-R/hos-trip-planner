from django.db import models
from django.contrib.auth.models import User

class TripUser(User):
    class Meta:
        proxy = True
        verbose_name = 'User (and their Trips)'
        verbose_name_plural = 'Users (and their Trips)'

class Trip(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    current_cycle_hours = models.FloatField()
    distance = models.FloatField(null=True, blank=True)
    driving_time = models.FloatField(null=True, blank=True)
    route_geometry = models.TextField(null=True, blank=True) # Encoded polyline is string
    timeline = models.JSONField(null=True, blank=True) # Store generated HOS events
    log_sheets = models.JSONField(null=True, blank=True) # Store per-day ELD log sheets
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trip {self.id}: {self.current_location} -> {self.pickup_location} -> {self.dropoff_location}"
