WEEK_OFF_DAYS = {
    "Friday",
    "Saturday",
}


SCHEDULES = {
    "workday": [
        {
            "checkin_type": "morning",
            "start_time": "04:15",
            "end_time": "05:00",
            "description": "Morning check-in",
        },
        {
            "checkin_type": "breakfast",
            "start_time": "09:30",
            "end_time": "10:30",
            "description": "Breakfast check-in",
        },
        {
            "checkin_type": "lunch",
            "start_time": "13:00",
            "end_time": "14:00",
            "description": "Lunch check-in",
        },
        {
            "checkin_type": "dinner",
            "start_time": "20:00",
            "end_time": "21:00",
            "description": "Dinner check-in",
        },
    ],
    "week_off": [
        {
            "checkin_type": "morning",
            "start_time": "08:00",
            "end_time": "09:00",
            "description": "Morning check-in",
        },
        {
            "checkin_type": "breakfast",
            "start_time": "09:00",
            "end_time": "10:30",
            "description": "Breakfast check-in",
        },
        {
            "checkin_type": "lunch",
            "start_time": "13:30",
            "end_time": "14:30",
            "description": "Lunch check-in",
        },
        {
            "checkin_type": "dinner",
            "start_time": "20:30",
            "end_time": "21:30",
            "description": "Dinner check-in",
        },
    ],
    "sunday_travel_workday": [
        {
            "checkin_type": "wake_up",
            "start_time": "01:30",
            "end_time": "02:00",
            "description": "Wake up before Pondy travel",
        },
        {
            "checkin_type": "pondy_departure",
            "start_time": "02:00",
            "end_time": "02:30",
            "description": "Leave Pondy for office",
        },
        {
            "checkin_type": "office_arrival",
            "start_time": "05:00",
            "end_time": "05:30",
            "description": "Reach Thiruvanmiyur and continue to office",
        },
        {
            "checkin_type": "work",
            "start_time": "06:00",
            "end_time": "15:00",
            "description": "Office shift",
        },
    ],
    "thursday_travel_workday": [
        {
            "checkin_type": "morning",
            "start_time": "04:15",
            "end_time": "05:00",
            "description": "Morning check-in",
        },
        {
            "checkin_type": "work",
            "start_time": "06:00",
            "end_time": "15:00",
            "description": "Office shift",
        },
        {
            "checkin_type": "pondy_departure",
            "start_time": "15:00",
            "end_time": "15:15",
            "description": "Immediately leave for Pondy after shift",
        },
    ],
}


def get_schedule_for_day_type(day_type):
    return SCHEDULES.get(day_type, SCHEDULES["workday"])


def get_default_day_type(day_name):
    if day_name in WEEK_OFF_DAYS:
        return "week_off"

    if day_name == "Sunday":
        return "sunday_travel_workday"

    if day_name == "Thursday":
        return "thursday_travel_workday"

    return "workday"