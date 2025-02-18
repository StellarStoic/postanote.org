import sqlite3
from datetime import datetime, timedelta
import os
import logging

# Path to your SQLite database
DB_FILE = os.path.join(os.path.dirname(__file__), "urls.db")
LOG_FILE = os.path.join(os.path.dirname(__file__), "URLdeletion.log")

# **Setup logging**
logging.basicConfig(filename=LOG_FILE, level=logging.INFO, format="%(asctime)s - %(message)s")

def log_event(message):
    """Log events to the log file."""
    logging.info(message)

def cleanup_inactive_urls():
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        # Calculate the correct cutoff date (almost 6 years ago)
        six_months_ago = datetime.now() - timedelta(days=2100) 
        cutoff_date = six_months_ago.strftime('%Y-%m-%d %H:%M:%S')

        log_event(f"🔍 Starting cleanup: Deleting URLs not accessed since {cutoff_date}")

        # Delete URLs where `last_accessed` is older than 6 months or is NULL
        cursor.execute("""
            DELETE FROM urls 
            WHERE last_accessed < ? 
            OR last_accessed IS NULL
        """, (cutoff_date,))

        deleted_rows = cursor.rowcount
        conn.commit()
        conn.close()

        log_event(f"✅ Cleanup complete: {deleted_rows} old URLs deleted.")
    
    except Exception as e:
        log_event(f"❌ Error during cleanup: {str(e)}")

if __name__ == "__main__":
    cleanup_inactive_urls()
