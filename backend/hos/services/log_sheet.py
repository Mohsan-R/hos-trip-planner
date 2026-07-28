from typing import List, Dict
from common.enums import DriverStatus

HOURS_PER_DAY = 24.0


class LogSheetBuilder:
    """
    Converts a flat HOS timeline into per-day ELD log sheets.

    Each day is a 24-hour grid (hours 0-24 relative to that day) with one
    segment per duty-status change, plus total hours per status. Events that
    cross midnight are split across day boundaries.
    """

    @staticmethod
    def build(timeline: List[Dict]) -> List[Dict]:
        if not timeline:
            return []

        day_segments: Dict[int, List[Dict]] = {}

        for event in timeline:
            start = event.get("start_time", 0.0)
            end = event.get("end_time", 0.0)
            if end <= start:
                continue

            cursor = start
            while cursor < end:
                day_index = int(cursor // HOURS_PER_DAY)
                day_start_abs = day_index * HOURS_PER_DAY
                day_end_abs = day_start_abs + HOURS_PER_DAY

                seg_start = cursor
                seg_end = min(end, day_end_abs)

                day_segments.setdefault(day_index, []).append({
                    "status": event.get("status"),
                    "event_type": event.get("event_type"),
                    "start_hour": round(seg_start - day_start_abs, 4),
                    "end_hour": round(seg_end - day_start_abs, 4),
                    "duration": round(seg_end - seg_start, 4),
                    "location": event.get("location"),
                    "description": event.get("description"),
                    "distance": event.get("distance", 0.0),
                })

                cursor = seg_end

        # Pad each day to 24h with OFF_DUTY before and after activity
        for day_index, segments in day_segments.items():
            segments.sort(key=lambda s: s["start_hour"])
            padded = []

            # Gap before first event
            if segments[0]["start_hour"] > 0.001:
                padded.append({
                    "status": DriverStatus.OFF_DUTY.value,
                    "event_type": "OFF_DUTY",
                    "start_hour": 0.0,
                    "end_hour": round(segments[0]["start_hour"], 4),
                    "duration": round(segments[0]["start_hour"], 4),
                    "location": segments[0]["location"],
                    "description": "Off Duty",
                    "distance": 0.0,
                })

            padded.extend(segments)

            # Gap after last event
            last_end = segments[-1]["end_hour"]
            if last_end < HOURS_PER_DAY - 0.001:
                padded.append({
                    "status": DriverStatus.OFF_DUTY.value,
                    "event_type": "OFF_DUTY",
                    "start_hour": round(last_end, 4),
                    "end_hour": HOURS_PER_DAY,
                    "duration": round(HOURS_PER_DAY - last_end, 4),
                    "location": segments[-1]["location"],
                    "description": "Off Duty",
                    "distance": 0.0,
                })

            day_segments[day_index] = padded

        return LogSheetBuilder._assemble_sheets(day_segments)

    @staticmethod
    def _assemble_sheets(day_segments: Dict[int, List[Dict]]) -> List[Dict]:
        sheets = []
        for day_index in sorted(day_segments.keys()):
            segments = day_segments[day_index]
            totals = LogSheetBuilder._status_totals(segments)

            # Combined driving + on-duty figure (the "circled" total on a paper log)
            driving_on_duty = round(
                totals[DriverStatus.DRIVING.value] + totals[DriverStatus.ON_DUTY.value], 2
            )

            # Daily 24-hour audit: all four lines must sum to exactly 24h
            total_hours = round(sum(totals.values()), 2)
            is_valid_24h = abs(total_hours - HOURS_PER_DAY) < 0.01

            # Remarks: one entry per duty-status change (location + activity)
            remarks = LogSheetBuilder._remarks(segments)

            sheets.append({
                "day": day_index + 1,
                "segments": segments,
                "totals": totals,
                "driving_on_duty_total": driving_on_duty,
                "total_hours": total_hours,
                "is_valid_24h": is_valid_24h,
                "remarks": remarks,
                "total_miles": round(sum(s.get("distance", 0.0) for s in segments), 1),
            })
        return sheets

    @staticmethod
    def _remarks(segments: List[Dict]) -> List[Dict]:
        """One remark per status change: the hour, location (city/state), and activity."""
        remarks = []
        prev_status = None
        for seg in segments:
            if seg.get("status") != prev_status:
                remarks.append({
                    "hour": seg.get("start_hour"),
                    "status": seg.get("status"),
                    "location": seg.get("location"),
                    "activity": seg.get("description"),
                })
                prev_status = seg.get("status")
        return remarks

    @staticmethod
    def _status_totals(segments: List[Dict]) -> Dict[str, float]:
        totals = {
            DriverStatus.OFF_DUTY.value: 0.0,
            DriverStatus.SLEEPER.value: 0.0,
            DriverStatus.DRIVING.value: 0.0,
            DriverStatus.ON_DUTY.value: 0.0,
        }
        for seg in segments:
            status = seg.get("status")
            if status in totals:
                totals[status] += seg.get("duration", 0.0)
        return {k: round(v, 2) for k, v in totals.items()}
