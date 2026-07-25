from typing import List
from common.constants import (
    FUEL_INTERVAL_MILES, FUEL_DURATION, PICKUP_DURATION, DROPOFF_DURATION,
    BREAK_DURATION, OFF_DUTY_RESET, CYCLE_RESTART,
    SLEEPER_BERTH_MIN, SLEEPER_SPLIT_MIN
)
from common.enums import DriverStatus, EventType
from hos.domain.driver_state import DriverState
from hos.domain.timeline_event import TimelineEvent
from hos.domain.route_segment import RouteSegment
from hos.services.rule_engine import RuleEngine

class Scheduler:
    def __init__(self, initial_cycle_hours: float = 0.0):
        self.state = DriverState(current_cycle_hours=initial_cycle_hours)
        self.timeline: List[TimelineEvent] = []

    def _add_event(self, status: DriverStatus, event_type: EventType, duration: float, location: str, description: str, distance: float = 0.0):
        if duration <= 0:
            return
            
        event = TimelineEvent(
            status=status,
            event_type=event_type,
            start_time=self.state.current_time,
            end_time=self.state.current_time + duration,
            duration=duration,
            distance=distance,
            location=location,
            description=description
        )
        self.timeline.append(event)
        
        self.state.current_time += duration
        
        if status in [DriverStatus.DRIVING, DriverStatus.ON_DUTY]:
            self.state.current_duty_hours += duration
            self.state.current_cycle_hours += duration
            self.state.drive_since_break += duration  # 8-hr break window counts all on-duty time, not just driving

        if status == DriverStatus.DRIVING:
            self.state.current_drive_hours += duration

        if status in [DriverStatus.OFF_DUTY, DriverStatus.SLEEPER]:
            if duration >= 34.0:
                RuleEngine.reset_cycle_clock(self.state)
                self.state.sleeper_berth_pending = False
            elif duration >= 10.0:
                RuleEngine.reset_daily_clocks(self.state)
                self.state.sleeper_berth_pending = False
            elif status == DriverStatus.SLEEPER and duration >= SLEEPER_BERTH_MIN:
                # First half of sleeper split (≥7h): mark pending, don't reset clocks yet
                self.state.sleeper_berth_pending = True
            elif self.state.sleeper_berth_pending and duration >= SLEEPER_SPLIT_MIN:
                # Second half of sleeper split (≥2h): now apply full reset
                RuleEngine.reset_daily_clocks(self.state)
                self.state.sleeper_berth_pending = False
            elif duration >= 0.5:
                RuleEngine.reset_break_clock(self.state)
            
    def _check_and_apply_duty_limits(self, required_duty_time: float) -> bool:
        """If a non-driving duty event (like Fuel or Pickup) pushes the driver over the 14/70 limits, insert rest first."""
        if required_duty_time > RuleEngine.remaining_cycle(self.state):
            self._add_event(DriverStatus.OFF_DUTY, EventType.REST, CYCLE_RESTART, self.state.current_location, "34-Hour Restart")
            return True
        if required_duty_time > RuleEngine.check_14_hour(self.state):
            self._add_event(DriverStatus.OFF_DUTY, EventType.REST, OFF_DUTY_RESET, self.state.current_location, "10-Hour Reset")
            return True
        return False

    def simulate_trip(self, segments: List[RouteSegment]) -> List[TimelineEvent]:
        for index, segment in enumerate(segments):
            remaining_distance = segment.distance
            remaining_duration = segment.duration
            current_speed = remaining_distance / remaining_duration if remaining_duration > 0 else 0
            
            self.state.current_location = segment.start_location
            
            while remaining_distance > 0.001 and remaining_duration > 0.001:
                # 1. Need Fuel?
                if self.state.miles_since_fuel >= FUEL_INTERVAL_MILES:
                    # Do not insert a fuel stop if we've arrived exactly at the final destination
                    if index == len(segments) - 1 and remaining_distance <= 0.001:
                        pass
                    else:
                        if not self._check_and_apply_duty_limits(FUEL_DURATION):
                            self._add_event(DriverStatus.ON_DUTY, EventType.FUEL, FUEL_DURATION, self.state.current_location, "Fuel Stop")
                            self.state.miles_since_fuel = 0.0
                        continue

                # 2. Need Break?
                if RuleEngine.needs_break(self.state):
                    self._add_event(DriverStatus.OFF_DUTY, EventType.BREAK, BREAK_DURATION, self.state.current_location, "30-Minute Break")
                    continue
                    
                # 3. Need Rest? Use sleeper berth split (7h+2h) if mid-trip, else full 10h reset
                if RuleEngine.remaining_cycle(self.state) <= 0:
                    self._add_event(DriverStatus.OFF_DUTY, EventType.REST, CYCLE_RESTART, self.state.current_location, "34-Hour Restart")
                    continue

                if RuleEngine.max_drive_available(self.state) <= 0 or RuleEngine.max_duty_available(self.state) <= 0:
                    if not self.state.sleeper_berth_pending:
                        # Use 7h sleeper berth as first split half
                        self._add_event(DriverStatus.SLEEPER, EventType.REST, SLEEPER_BERTH_MIN, self.state.current_location, "Sleeper Berth (7h)")
                    else:
                        # Complete split with 2h off-duty
                        self._add_event(DriverStatus.OFF_DUTY, EventType.REST, SLEEPER_SPLIT_MIN, self.state.current_location, "Sleeper Split (2h)")
                    continue
                    
                # 4. Drive
                drive_available = RuleEngine.max_drive_available(self.state)
                duty_available = RuleEngine.max_duty_available(self.state)
                max_drive_now = min(drive_available, duty_available)
                
                if max_drive_now > 0:
                    time_to_fuel = (FUEL_INTERVAL_MILES - self.state.miles_since_fuel) / current_speed if current_speed > 0 else float('inf')
                    time_to_break = RuleEngine.time_until_break(self.state)
                    
                    drive_time = min(max_drive_now, remaining_duration, time_to_fuel, time_to_break)
                    
                    if drive_time <= 0.001:
                        # Prevent infinite loops if floating point gets stuck
                        drive_time = 0.001
                        
                    drive_dist = drive_time * current_speed
                    
                    location_desc = f"En route to {segment.end_location}"
                    self._add_event(DriverStatus.DRIVING, EventType.DRIVE, drive_time, location_desc, f"Driving {drive_dist:.1f} mi", distance=drive_dist)
                    
                    remaining_duration -= drive_time
                    remaining_distance -= drive_dist
                    self.state.miles_since_fuel += drive_dist
                    self.state.current_location = location_desc
                    
            # Segment complete. 
            self.state.current_location = segment.end_location
            
            # 5. Destination Logic (Pickup or Dropoff)
            if index == 0: # After Current -> Pickup
                while self._check_and_apply_duty_limits(PICKUP_DURATION): pass
                self._add_event(DriverStatus.ON_DUTY, EventType.PICKUP, PICKUP_DURATION, self.state.current_location, "Loading Cargo")
                
            elif index == len(segments) - 1: # After Pickup -> Dropoff
                while self._check_and_apply_duty_limits(DROPOFF_DURATION): pass
                self._add_event(DriverStatus.ON_DUTY, EventType.DROPOFF, DROPOFF_DURATION, self.state.current_location, "Unloading Cargo")
                
        return self.timeline
