from typing import List, Dict
from hos.domain.route_segment import RouteSegment
from hos.services.scheduler import Scheduler

class HOSEngine:
    @staticmethod
    def generate_timeline(legs: List[Dict], initial_cycle_hours: float) -> List[Dict]:
        """
        Coordinates the Scheduler to produce a valid FMCSA timeline based on route legs.
        legs is expected to be a list of dicts: {"from": str, "to": str, "distance": float, "duration": float}
        """
        # 1. Convert to RouteSegment domain models
        segments = []
        for leg in legs:
            segments.append(RouteSegment(
                start_location=leg.get("from", "Unknown"),
                end_location=leg.get("to", "Unknown"),
                distance=leg.get("distance", 0) * 0.000621371, # Convert meters to miles
                duration=leg.get("duration", 0) / 3600.0, # Convert seconds to hours
                geometry="" 
            ))
            
        # 2. Run simulation
        scheduler = Scheduler(initial_cycle_hours=initial_cycle_hours)
        timeline_events = scheduler.simulate_trip(segments)
        
        # 3. Convert back to dicts for API response/DB storage
        return [
            {
                "status": event.status.value,
                "event_type": event.event_type.value,
                "start_time": event.start_time,
                "end_time": event.end_time,
                "duration": event.duration,
                "distance": event.distance,
                "location": event.location,
                "description": event.description
            }
            for event in timeline_events
        ]
