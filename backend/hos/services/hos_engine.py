from typing import List, Dict
from hos.domain.route_segment import RouteSegment
from hos.services.scheduler import Scheduler
from hos.services.log_sheet import LogSheetBuilder

class HOSEngine:
    @staticmethod
    def generate_timeline(legs: List[Dict], initial_cycle_hours: float) -> Dict:
        """
        Returns {"timeline": [...], "log_sheets": [...]}
        """
        segments = []
        for leg in legs:
            segments.append(RouteSegment(
                start_location=leg.get("from", "Unknown"),
                end_location=leg.get("to", "Unknown"),
                distance=leg.get("distance", 0) * 0.000621371,
                duration=leg.get("duration", 0) / 3600.0,
                geometry=""
            ))

        scheduler = Scheduler(initial_cycle_hours=initial_cycle_hours)
        timeline_events = scheduler.simulate_trip(segments)

        timeline = [
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

        return {
            "timeline": timeline,
            "log_sheets": LogSheetBuilder.build(timeline)
        }

