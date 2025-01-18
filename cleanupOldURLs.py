import sqlite3
from datetime import datetime, timedelta
import os

# Path to your SQLite database
DB_FILE = os.path.join(os.path.dirname(__file__), "urls.db")

def cleanup_inactive_urls():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Calculate the cutoff date for inactive URLs
    six_months_ago = datetime.now() - timedelta(hours=12)
    # six_months_ago = datetime.now() - timedelta(days=180)
    cutoff_date = six_months_ago.strftime('%Y-%m-%d %H:%M:%S')

    # Delete URLs not accessed in the last 6 months
    cursor.execute("DELETE FROM urls WHERE last_accessed < ?", (cutoff_date,))
    conn.commit()
    conn.close()

    print(f"Cleaned up URLs not accessed since {cutoff_date}")

if __name__ == "__main__":
    cleanup_inactive_urls()
