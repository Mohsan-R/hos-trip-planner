from .ors_client import ORSClient
from trip.exceptions import RouteCalculationError

class RoutingService:
    def __init__(self):
        self.client = ORSClient()

    def calculate_route(self, current_coords: dict, pickup_coords: dict, dropoff_coords: dict) -> dict:
        coordinates = [
            [current_coords['lng'], current_coords['lat']],
            [pickup_coords['lng'], pickup_coords['lat']],
            [dropoff_coords['lng'], dropoff_coords['lat']]
        ]
        
        raw_response = self.client.directions(coordinates)
        
        try:
            route = raw_response['routes'][0]
            geometry = route.get('geometry', '')
            summary = route.get('summary', {'distance': 0, 'duration': 0})
            segments = route.get('segments', [])
            
            total_distance = summary.get('distance', 0)
            total_duration = summary.get('duration', 0)
            
            # ORS might merge segments if identical, or return empty segments if error.
            # Pad segments safely
            while len(segments) < 2:
                segments.append({"distance": 0, "duration": 0})

            legs = [
                {
                    "from": "Current",
                    "to": "Pickup",
                    "distance": segments[0].get('distance', 0),
                    "duration": segments[0].get('duration', 0)
                },
                {
                    "from": "Pickup",
                    "to": "Dropoff",
                    "distance": segments[1].get('distance', 0),
                    "duration": segments[1].get('duration', 0)
                }
            ]
            
            return {
                "distance": total_distance,
                "duration": total_duration,
                "geometry": geometry,
                "legs": legs
            }
        except Exception:
            raise RouteCalculationError(detail="No route found.")
