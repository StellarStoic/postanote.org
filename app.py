from flask import Flask, request, jsonify
import json
import os
import random
import string

app = Flask(__name__)

# Paths to .well-known directories
NOSTR_JSON_PATH = '/home/postanote.org/.well-known/nostr.json'
LNURLP_DIR = '/home/postanote.org/.well-known/lnurlp'
    
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
                    ["text/plain", "We're grateful for your kindness in supporting the postanote.org project through the received Zaps. Your generosity will make a positive impact on this initiative."],
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
    app.run(port=3000)
