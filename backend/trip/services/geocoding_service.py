from .ors_client import ORSClient
from trip.exceptions import LocationNotFound

class GeocodingService:
    def __init__(self):
        self.client = ORSClient()

    def get_coordinates(self, address: str, location_type: str = "Location") -> dict:
        try:
            return self.client.geocode(address)
        except LocationNotFound:
            # Re-raise with the specific location type (e.g., "Current location not found.")
            raise LocationNotFound(detail=f"{location_type} not found.")
