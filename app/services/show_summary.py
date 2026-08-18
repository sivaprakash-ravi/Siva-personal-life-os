from app.services.daily_summary import get_daily_summary


def main():
    summary = get_daily_summary()

    print(f"Daily Summary ({summary['date']})")
    print("--------------------------------")
    print(f"Total check-ins: {summary['total']}")
    print(f"Completed:       {summary['completed']}")
    print(f"Pending:         {summary['pending']}")
    print(f"Completion rate: {summary['completion_rate']}%")


if __name__ == "__main__":
    main()