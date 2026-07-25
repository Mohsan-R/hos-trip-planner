from hos.domain.driver_state import DriverState
from common.constants import MAX_DRIVING_HOURS, MAX_DUTY_WINDOW, MAX_CYCLE, BREAK_AFTER

def check_violations(state: DriverState) -> list:
    """Returns a list of violation strings if any FMCSA limit is breached."""
    violations = []
    # Add a tiny epsilon to prevent floating point inaccuracies
    EPSILON = 0.0001
    
    if state.current_drive_hours > MAX_DRIVING_HOURS + EPSILON:
        violations.append("11-Hour Driving Limit Exceeded")
    if state.current_duty_hours > MAX_DUTY_WINDOW + EPSILON:
        violations.append("14-Hour Duty Limit Exceeded")
    if state.current_cycle_hours > MAX_CYCLE + EPSILON:
        violations.append("70-Hour Cycle Limit Exceeded")
    if state.drive_since_break > BREAK_AFTER + EPSILON:
        violations.append("8-Hour Break Limit Exceeded")
        
    return violations
