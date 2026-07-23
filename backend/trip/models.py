from django.db import models

class Trip(models.Model):
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    current_cycle_hours = models.FloatField()
    distance = models.FloatField(null=True, blank=True)
    driving_time = models.FloatField(null=True, blank=True)
    route_geometry = models.TextField(null=True, blank=True) # Encoded polyline is string
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trip {self.id}: {self.current_location} -> {self.pickup_location} -> {self.dropoff_location}"
