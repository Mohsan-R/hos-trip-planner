from common.constants import (
    MAX_DRIVING_HOURS, MAX_DUTY_WINDOW, BREAK_AFTER, MAX_CYCLE
)
from hos.domain.driver_state import DriverState

class RuleEngine:
    @staticmethod
    def check_11_hour(state: DriverState) -> float:
        """Returns remaining driving hours under the 11-hour limit."""
        return max(0.0, MAX_DRIVING_HOURS - state.current_drive_hours)

    @staticmethod
    def check_14_hour(state: DriverState) -> float:
        """Returns remaining duty hours under the 14-hour limit."""
        return max(0.0, MAX_DUTY_WINDOW - state.current_duty_hours)

    @staticmethod
    def time_until_break(state: DriverState) -> float:
        """Returns remaining driving hours before a 30-min break is required."""
        return max(0.0, BREAK_AFTER - state.drive_since_break)

    @staticmethod
    def remaining_cycle(state: DriverState) -> float:
        """Returns remaining duty hours under the 70-hour cycle limit."""
        return max(0.0, MAX_CYCLE - state.current_cycle_hours)

    @staticmethod
    def needs_break(state: DriverState) -> bool:
        """Returns True if the driver MUST take a break before driving further."""
        return RuleEngine.time_until_break(state) <= 0.0

    @staticmethod
    def max_drive_available(state: DriverState) -> float:
        """Returns the absolute maximum time the driver can currently drive before hitting ANY limit."""
        return min(
            RuleEngine.check_11_hour(state),
            RuleEngine.check_14_hour(state),
            RuleEngine.time_until_break(state),
            RuleEngine.remaining_cycle(state)
        )

    @staticmethod
    def max_duty_available(state: DriverState) -> float:
        """Returns the absolute maximum time the driver can remain ON DUTY before hitting ANY limit."""
        return min(
            RuleEngine.check_14_hour(state),
            RuleEngine.remaining_cycle(state)
        )

    @staticmethod
    def can_restart(state: DriverState, off_duty_hours: float) -> bool:
        """Returns True if the off_duty_hours satisfies the 34-hour restart rule."""
        return off_duty_hours >= 34.0

    @staticmethod
    def reset_break_clock(state: DriverState) -> None:
        """A 30-minute off-duty or sleeper period resets the consecutive 8-hour drive break."""
        state.drive_since_break = 0.0

    @staticmethod
    def reset_daily_clocks(state: DriverState) -> None:
        """A 10-hour off-duty period resets the 11 and 14-hour clocks."""
        state.current_drive_hours = 0.0
        state.current_duty_hours = 0.0
        RuleEngine.reset_break_clock(state)

    @staticmethod
    def reset_cycle_clock(state: DriverState) -> None:
        """A 34-hour off-duty period resets the 70-hour cycle."""
        state.current_cycle_hours = 0.0
        RuleEngine.reset_daily_clocks(state)
