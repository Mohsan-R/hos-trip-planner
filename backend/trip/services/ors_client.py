import os
import requests
from django.conf import settings
from requests.exceptions import Timeout, ConnectionError, HTTPError
from trip.exceptions import (
    LocationNotFound,
    RoutingServiceUnavailable,
    RoutingTimeout,
    RoutingTooManyRequests,
    RoutingBadGateway,
    RouteCalculationError
)

class ORSClient:
    def __init__(self):
        self.api_key = getattr(settings, 'ORS_API_KEY', os.environ.get('ORS_API_KEY', ''))
        self.base_url = "https://api.openrouteservice.org"
        self.timeout = 10

    def _handle_request_exceptions(self, e):
        if isinstance(e, Timeout):
            raise RoutingTimeout()
        elif isinstance(e, ConnectionError):
            raise RoutingServiceUnavailable(detail="Unable to connect to routing service.")
        elif isinstance(e, HTTPError):
            status = e.response.status_code
            if status in [401, 403]:
                raise RoutingServiceUnavailable()
            elif status == 429:
                raise RoutingTooManyRequests()
            elif status >= 500:
                raise RoutingBadGateway()
            elif status == 400 or status == 404:
                raise RouteCalculationError()
        raise RoutingBadGateway(detail="An unexpected routing error occurred.")

    def geocode(self, address: str) -> dict:
        url = f"{self.base_url}/geocode/search"
        params = {
            "api_key": self.api_key,
            "text": address,
            "size": 1
        }
        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
        except Exception as e:
            self._handle_request_exceptions(e)

        data = response.json()
        if not data.get("features"):
            # The test case LOC-04 expects "Current location not found." etc.
            # We will raise a generic LocationNotFound here and let GeocodingService format it.
            raise LocationNotFound(detail="Location not found.")
        
        coords = data["features"][0]["geometry"]["coordinates"]
        return {"lng": coords[0], "lat": coords[1]}

    def directions(self, coordinates: list) -> dict:
        url = f"{self.base_url}/v2/directions/driving-hgv"
        headers = {
            "Authorization": self.api_key,
            "Content-Type": "application/json"
        }
        payload = {
            "coordinates": coordinates
        }
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=self.timeout)
            response.raise_for_status()
        except Exception as e:
            self._handle_request_exceptions(e)
            
        return response.json()
