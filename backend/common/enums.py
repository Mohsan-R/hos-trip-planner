from enum import Enum

class DriverStatus(str, Enum):
    OFF_DUTY = "OFF_DUTY"
    SLEEPER = "SLEEPER"
    DRIVING = "DRIVING"
    ON_DUTY = "ON_DUTY"

class EventType(str, Enum):
    DRIVE = "DRIVE"
    BREAK = "BREAK"
    FUEL = "FUEL"
    REST = "REST"
    PICKUP = "PICKUP"
    DROPOFF = "DROPOFF"
    OFF_DUTY = "OFF_DUTY"
