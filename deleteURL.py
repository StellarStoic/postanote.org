import sqlite3
import os
import json
from datetime import datetime
import html

DB_FILE = os.path.join(os.path.dirname(__file__), "urls.db")
DELETED_LOG_FILE = os.path.join(os.path.dirname(__file__), "deletedURLs.json")

def load_deleted_log():
    if os.path.exists(DELETED_LOG_FILE):
        with open(DELETED_LOG_FILE, 'r') as f:
            return json.load(f)
    return []

def save_deleted_log(logs):
    with open(DELETED_LOG_FILE, 'w') as f:
        json.dump(logs, f, indent=2)

def search_url(cursor, input_value):
    input_value = input_value.strip()

    # Check: Is this a short code directly?
    cursor.execute("SELECT * FROM urls WHERE short = ?", (input_value,))
    result = cursor.fetchone()
    if result:
        return result

    # Check: Is this a full shortened URL? (e.g., https://snofl.com/abc123)
    if input_value.startswith("http"):
        parsed = input_value.split("/")
        if len(parsed) >= 4:  # Should have at least protocol + domain + short
            short_candidate = parsed[-1]
            cursor.execute("SELECT * FROM urls WHERE short = ?", (short_candidate,))
            result = cursor.fetchone()
            if result:
                return result

    # Check: Exact match for original URL in DB (no fuzzy, no normalize)
    cursor.execute("SELECT * FROM urls WHERE original = ?", (input_value,))
    result = cursor.fetchone()
    if result:
        return result

    return None

def delete_url():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    user_input = input("🔍 Enter the URL you like to delete from DB (original, shortened, or short code)?\n> ").strip()

    match = search_url(cursor, user_input)

    if not match:
        print("❌ No matching URL found.")
        conn.close()
        return

    short, original, timestamp, visits, last_accessed = match
    print("\n✅ Match found:")
    print(f"  Short Code  : {short}")
    print(f"  Original URL: {original}")
    print(f"  Created At  : {timestamp}")
    print(f"  Visits      : {visits}")
    print(f"  Last Access : {last_accessed}")

    confirm = input("\n❗ Are you sure you want to delete this URL? (y/n): ").strip().lower()
    if confirm != 'y':
        print("Cancelled.")
        conn.close()
        return

    reason = input("📝 Enter reason for deletion:\n> ").strip()

    # Delete from DB
    cursor.execute("DELETE FROM urls WHERE short = ?", (short,))
    conn.commit()

    # Store deletion record
    deleted_log = load_deleted_log()
    deleted_log.append({
        "short": short,
        "original": original,
        "timestamp": timestamp,
        "visits": visits,
        "last_accessed": last_accessed,
        "deleted_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "reason": reason
    })
    save_deleted_log(deleted_log)

    print("\n✅ URL deleted and logged in deletedURLs.json.")
    conn.close()

if __name__ == "__main__":
    delete_url()
