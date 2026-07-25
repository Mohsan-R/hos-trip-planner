from dataclasses import dataclass
from common.enums import DriverStatus, EventType

@dataclass
class TimelineEvent:
    status: DriverStatus
    event_type: EventType
    start_time: float
    end_time: float
    duration: float
    distance: float
    location: str
    description: str
