from flask import Flask, request, jsonify, redirect, send_from_directory
import json
import html
import sqlite3
import hashlib
import os
import sys
import random
import string
from datetime import datetime, timedelta

app = Flask(__name__)
# DB_FILE = "/home/postanote.org/urls.db"
DB_FILE = os.path.join(os.path.dirname(__file__), "urls.db")

# Paths to .well-known directories
NOSTR_JSON_PATH = '/home/postanote.org/.well-known/nostr.json'
LNURLP_DIR = '/home/postanote.org/.well-known/lnurlp'


# Initialize database
def init_db():
    db_dir = os.path.dirname(DB_FILE)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir)  # Create the directory if it doesn't exist
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS urls (
            short      TEXT PRIMARY KEY,
            original   TEXT,
            timestamp  TEXT DEFAULT CURRENT_TIMESTAMP,
            visits     INTEGER DEFAULT 0,
            last_accessed TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    # Ensure the new columns exist for existing databases
    cursor.execute("PRAGMA table_info(urls)")
    columns = [col[1] for col in cursor.fetchall()]
    if "visits" not in columns:
        cursor.execute("ALTER TABLE urls ADD COLUMN visits INTEGER DEFAULT 0")
    if "last_accessed" not in columns:
        cursor.execute("ALTER TABLE urls ADD COLUMN last_accessed TEXT DEFAULT CURRENT_TIMESTAMP")
        
    conn.commit()
    conn.close()

def generate_short_url():
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k=6))

@app.route('/shorten', methods=['POST'])
def shorten_url():
    data = request.json
    original_url = data.get("url")
    if not original_url:
        return jsonify({"error": "URL is required"}), 400

    # Generate a consistent hash for the original URL
    url_hash = hashlib.md5(original_url.encode()).hexdigest()[:6]

    # Check if the URL already exists in the database
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT short FROM urls WHERE original = ?", (original_url,))
    existing_short = cursor.fetchone()

    if existing_short:
        conn.close()
        return jsonify({"short_url": f"https://postanote.org/{existing_short[0]}"}), 200

    # If no existing short link, create a new one
    cursor.execute("INSERT INTO urls (short, original) VALUES (?, ?)", (url_hash, original_url))
    conn.commit()
    conn.close()

    return jsonify({"short_url": f"https://postanote.org/{url_hash}"}), 201

@app.route('/<short>', methods=['GET'])
def redirect_short_url(short):
    # Connect to the database
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Look for the short URL in the database
    cursor.execute("SELECT original, visits FROM urls WHERE short = ?", (short,))
    result = cursor.fetchone()

    if result:
        original_url = html.unescape(result[0])
        visits = result[1] if result[1] is not None else 0

        # Increment visits and update last_accessed
        cursor.execute(
            "UPDATE urls SET visits = ?, last_accessed = CURRENT_TIMESTAMP WHERE short = ?",
            (visits + 1, short)
        )
        conn.commit()
        conn.close()

        # Redirect to the original URL
        return redirect(original_url, code=302)

    # Close the connection if the short URL is not found
    conn.close()

    # Handle as a static file if it’s not a valid short URL
    try:
        return send_from_directory('.', short)
    except FileNotFoundError:
        pass  # Continue to 404 handling

    # Return 404 for invalid short URLs or files
    return jsonify({"error": "URL not found"}), 404

# get visitor counter and time of last visit
@app.route('/visits', methods=['GET'])
def get_visits():
    page = int(request.args.get('page', 1))  # Default to page 1
    per_page = int(request.args.get('per_page', 10))  # Default 10 rows per page
    offset = (page - 1) * per_page

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Fetch rows with pagination
    cursor.execute(
        "SELECT short, original, timestamp, visits, last_accessed FROM urls LIMIT ? OFFSET ?",
        (per_page, offset)
    )
    data = cursor.fetchall()
    conn.close()

    # Log fetched data for debugging
    app.logger.debug(f"Fetched data: {data}")

    return jsonify([
        {
            "short": short,
            "original": original,
            "timestamp": timestamp,
            "visits": visits,
            "last_accessed": last_accessed
        }
        for short, original, timestamp, visits, last_accessed in data
    ])
    
@app.route('/<path:filename>', methods=['GET'])
def serve_static_file(filename):
    return send_from_directory('.', filename)

@app.route('/', methods=['GET'])
def home():
    return send_from_directory('.', 'index.html')

@app.route('/.well-known/nostr.json', methods=['POST'])
def update_nostr_json():
    try:
        data = request.json
        if 'names' not in data:
            return jsonify({"error": "Invalid data format"}), 400
        
        # Read existing nostr.json (if exists)
        try:
            with open(NOSTR_JSON_PATH, 'r') as f:
                existing_data = json.load(f)
        except FileNotFoundError:
            existing_data = {"names": {}}
            
        # Overwrite Protection - Check if name exists
        for name, pubkey in data['names'].items():
            if name in existing_data['names']:
                return jsonify({"error": f"Name '{name}' already exists and cannot be overwritten."}), 409

        # Update nostr.json with new names/pubkeys
        existing_data['names'].update(data['names'])

        # Write back to nostr.json
        with open(NOSTR_JSON_PATH, 'w') as f:
            json.dump(existing_data, f, indent=2)

        # Create LNURLP file for each new name
        for name, pubkey in data['names'].items():
            lnurlp_content = {
                "callback": "https://livingroomofsatoshi.com/api/v1/lnurl/payreq/2ef0b1ef-ec6e-43b0-ba78-90f7c59cc95f",
                "maxSendable": 100000000000,
                "minSendable": 1000,
                "metadata": [
                    ["text/plain", "Thank you for supporting the postanote.org project with your Zaps. Your generosity helps drive this initiative forward!"],
                    ["text/identifier", "latterswiss19@walletofsatoshi.com"]
                ],
                "commentAllowed": 32,
                "tag": "payRequest",
                "allowsNostr": True,
                "nostrPubkey": "be1d89794bf92de5dd64c1e60f6a2c70c140abac9932418fee30c5c637fe9479"
            }
            # Ensure lnurlp directory exists
            os.makedirs(LNURLP_DIR, exist_ok=True)

            lnurlp_path = os.path.join(LNURLP_DIR, name)
            
            # Overwrite Protection - Check if LNURLP file exists
            if os.path.exists(lnurlp_path):
                return jsonify({"error": f"LNURLP for '{name}' already exists."}), 409
            
            with open(lnurlp_path, 'w') as lnurlp_file:
                json.dump(lnurlp_content, lnurlp_file, indent=2)

        return jsonify({"message": "nostr.json and lnurlp files updated successfully."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# LNURL get data
@app.route('/.well-known/lnurlp/<name>', methods=['GET'])
def serve_lnurlp(name):
    try:
        lnurlp_path = os.path.join(LNURLP_DIR, name)
        
        if not os.path.exists(lnurlp_path):
            return jsonify({"error": "LNURLP file not found"}), 404
        
        # Read and return the contents of the LNURLP file
        with open(lnurlp_path, 'r') as f:
            lnurlp_content = f.read()

        # Return as application/json
        return lnurlp_content, 200, {'Content-Type': 'application/json'}

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# nostr.json GET for nip05
@app.route('/.well-known/nostr.json', methods=['GET'])
def serve_nostr_json():
    try:
        if not os.path.exists(NOSTR_JSON_PATH):
            return jsonify({"error": "nostr.json not found"}), 404

        with open(NOSTR_JSON_PATH, 'r') as f:
            nostr_content = f.read()

        # Return the nostr.json content as application/json
        return nostr_content, 200, {'Content-Type': 'application/json'}

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    init_db()  # Initialize the database
    app.run(port=3000)




# if __name__ == '__main__':
#     init_db() # Initialize the database
#     app.run(debug=True, host='127.0.0.1', port=5500)