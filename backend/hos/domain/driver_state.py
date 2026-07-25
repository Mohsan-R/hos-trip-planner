from dataclasses import dataclass

@dataclass
class DriverState:
    current_cycle_hours: float
    current_drive_hours: float = 0.0
    current_duty_hours: float = 0.0
    miles_since_fuel: float = 0.0
    drive_since_break: float = 0.0
    current_time: float = 0.0 # Time elapsed in simulation in hours
    current_location: str = "Unknown"
