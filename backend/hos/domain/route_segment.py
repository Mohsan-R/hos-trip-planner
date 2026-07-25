from dataclasses import dataclass

@dataclass
class RouteSegment:
    start_location: str
    end_location: str
    distance: float # miles
    duration: float # hours
    geometry: str
