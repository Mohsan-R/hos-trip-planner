from django.test import TestCase
from hos.domain.driver_state import DriverState
from hos.services.rule_engine import RuleEngine
from hos.services.violations import check_violations
from hos.services.hos_engine import HOSEngine

class RuleEngineTests(TestCase):
    def test_11_hour_limit(self):
        state = DriverState(current_cycle_hours=0)
        state.current_drive_hours = 11.0
        self.assertEqual(len(check_violations(state)), 0)
        self.assertEqual(RuleEngine.check_11_hour(state), 0.0)

        state.current_drive_hours = 11.1
        self.assertIn("11-Hour Driving Limit Exceeded", check_violations(state))

    def test_14_hour_limit(self):
        state = DriverState(current_cycle_hours=0)
        state.current_duty_hours = 14.0
        self.assertEqual(len(check_violations(state)), 0)
        
        state.current_duty_hours = 14.1
        self.assertIn("14-Hour Duty Limit Exceeded", check_violations(state))

    def test_70_hour_limit(self):
        state = DriverState(current_cycle_hours=70.0)
        self.assertEqual(len(check_violations(state)), 0)
        
        state.current_cycle_hours = 70.5
        self.assertIn("70-Hour Cycle Limit Exceeded", check_violations(state))

    def test_break_required(self):
        state = DriverState(current_cycle_hours=0)
        state.drive_since_break = 7.9
        self.assertFalse(RuleEngine.needs_break(state))
        
        state.drive_since_break = 8.0
        self.assertTrue(RuleEngine.needs_break(state))
        
        state.drive_since_break = 8.1
        self.assertIn("8-Hour Break Limit Exceeded", check_violations(state))

class HOSEngineIntegrationTests(TestCase):
    def test_100_mile_trip_no_break_no_fuel(self):
        legs = [{"from": "A", "to": "B", "distance": 100 / 0.000621371, "duration": 2 * 3600}]
        timeline = HOSEngine.generate_timeline(legs, initial_cycle_hours=0.0)["timeline"]
        events = [e["event_type"] for e in timeline]
        self.assertIn("PICKUP", events)
        self.assertIn("DRIVE", events)
        self.assertNotIn("BREAK", events)
        self.assertNotIn("FUEL", events)

    def test_600_mile_trip_break_only(self):
        legs = [{"from": "A", "to": "B", "distance": 600 / 0.000621371, "duration": 10 * 3600}]
        timeline = HOSEngine.generate_timeline(legs, initial_cycle_hours=0.0)["timeline"]
        events = [e["event_type"] for e in timeline]
        self.assertIn("BREAK", events)
        self.assertNotIn("FUEL", events)

    def test_1050_mile_trip_fuel_inserted(self):
        legs = [{"from": "A", "to": "B", "distance": 1050 / 0.000621371, "duration": 16 * 3600}]
        timeline = HOSEngine.generate_timeline(legs, initial_cycle_hours=0.0)["timeline"]
        events = [e["event_type"] for e in timeline]
        self.assertIn("FUEL", events)

    def test_zero_distance_first_leg(self):
        legs = [
            {"from": "Current", "to": "Pickup", "distance": 0, "duration": 0},
            {"from": "Pickup", "to": "Dropoff", "distance": 100 / 0.000621371, "duration": 2 * 3600}
        ]
        timeline = HOSEngine.generate_timeline(legs, initial_cycle_hours=0.0)["timeline"]
        events = [e["event_type"] for e in timeline]
        self.assertEqual(events[0], "PICKUP") # First thing is pickup

    def test_cycle_exceeded_before_pickup(self):
        # Initial cycle = 65.0
        # Leg 1: 4.5 hours driving. Cycle becomes 69.5.
        # Leg 1 ends.
        # PICKUP takes 1.0 hour. This would exceed 70!
        # So REST(34h) must be inserted BEFORE PICKUP.
        legs = [
            {"from": "Current", "to": "Pickup", "distance": 270 / 0.000621371, "duration": 4.5 * 3600},
            {"from": "Pickup", "to": "Dropoff", "distance": 10 / 0.000621371, "duration": 0.5 * 3600}
        ]
        timeline = HOSEngine.generate_timeline(legs, initial_cycle_hours=65.0)["timeline"]
        events = [e["event_type"] for e in timeline]

        # Verify that REST happens right before PICKUP
        rest_idx = events.index("REST")
        pickup_idx = events.index("PICKUP")
        self.assertEqual(rest_idx, pickup_idx - 1)

    def test_cycle_at_69_hours_immediate_restart(self):
        # Cycle is at 69. Drive limit is 1 hour before cycle hits 70.
        legs = [{"from": "A", "to": "B", "distance": 300 / 0.000621371, "duration": 5 * 3600}]
        timeline = HOSEngine.generate_timeline(legs, initial_cycle_hours=69.0)["timeline"]
        events = [e["event_type"] for e in timeline]

        # Timeline should be: DRIVE(1h), REST(34h), DRIVE(4h), PICKUP(1h)
        self.assertEqual(events[0], "DRIVE")
        self.assertEqual(events[1], "REST")
        self.assertEqual(events[2], "DRIVE")
        self.assertEqual(events[3], "PICKUP")
