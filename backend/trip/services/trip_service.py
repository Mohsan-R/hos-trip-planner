from .geocoding_service import GeocodingService
from .routing_service import RoutingService
from trip.models import Trip
from rest_framework.exceptions import APIException
from trip.exceptions import RouteCalculationError

class DatabaseError(APIException):
    status_code = 500
    default_detail = 'Unable to save trip.'
    default_code = 'database_error'

class TripService:
    def __init__(self):
        self.geocoder = GeocodingService()
        self.router = RoutingService()

    def create_trip(self, data: dict) -> dict:
        # 1. Geocode with specific labels to match QA tests
        current_coords = self.geocoder.get_coordinates(data['current_location'], "Current location")
        pickup_coords = self.geocoder.get_coordinates(data['pickup_location'], "Pickup location")
        dropoff_coords = self.geocoder.get_coordinates(data['dropoff_location'], "Dropoff location")
        
        # 2. Route
        route_result = self.router.calculate_route(current_coords, pickup_coords, dropoff_coords)
        
        # 3. Save Trip
        try:
            trip = Trip.objects.create(
                current_location=data['current_location'],
                pickup_location=data['pickup_location'],
                dropoff_location=data['dropoff_location'],
                current_cycle_hours=data['current_cycle_hours'],
                distance=route_result['distance'],
                driving_time=route_result['duration'],
                route_geometry=route_result['geometry']
            )
        except Exception:
            raise DatabaseError()
        
        # 4. Return combined normalized data
        return {
            "id": trip.id,
            "current_location": trip.current_location,
            "pickup_location": trip.pickup_location,
            "dropoff_location": trip.dropoff_location,
            "current_cycle_hours": trip.current_cycle_hours,
            "distance": trip.distance,
            "duration": trip.driving_time,
            "geometry": trip.route_geometry,
            "legs": route_result['legs']
        }
